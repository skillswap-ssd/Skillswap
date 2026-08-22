import { describe, expect, it } from "vitest";
import type { SkillSwapRequest } from "@/data/models";
import {
  awardCredits,
  canTransitionSwapStatus,
  captureCreditHold,
  checkAndExpireHolds,
  confirmSwapCompletion,
  createCreditHold,
  createEmptyCreditState,
  getCreditAudit,
  grantInitialCredits,
  refundExchange,
  releaseCreditHold,
  settleExchange,
} from "./credit-engine";
import { CREDIT_RULES } from "./credit-rules";
import { validateCreditAccount, validateEntireCreditSystem } from "./credit-validation";

describe("Credit System Hardening & Invariant Tests", () => {
  it("Account: initial credits granted once idempotently", () => {
    let state = createEmptyCreditState();
    const userId = "u_init";

    const res1 = grantInitialCredits(state, userId, "grant_key_1");
    expect(res1.result.success).toBe(true);
    expect(res1.state.accounts[userId].available).toBe(CREDIT_RULES.INITIAL_CREDITS);

    // Replay initial grant
    const res2 = grantInitialCredits(res1.state, userId, "grant_key_1");
    expect(res2.result.code).toBe("IDEMPOTENT_REPLAY");
    expect(res2.state.accounts[userId].available).toBe(CREDIT_RULES.INITIAL_CREDITS);
    expect(res2.state.transactions.length).toBe(1);

    const validation = validateCreditAccount(res2.state, userId);
    expect(validation.valid).toBe(true);
  });

  it("Spending & Holds: sufficient credits succeeds, insufficient fails, balances nonnegative", () => {
    let state = createEmptyCreditState();
    const userId = "u_spend";
    state = grantInitialCredits(state, userId, "grant_spend").state;

    // Create Hold of 2 credits
    const holdRes = createCreditHold(state, {
      userId,
      amount: 2,
      referenceType: "swap",
      referenceId: "swap_101",
      idempotencyKey: "hold_swap_101",
    });

    expect(holdRes.result.success).toBe(true);
    expect(holdRes.state.accounts[userId].available).toBe(3);
    expect(holdRes.state.accounts[userId].held).toBe(2);

    // Excess hold failure
    const excessHoldRes = createCreditHold(holdRes.state, {
      userId,
      amount: 5,
      referenceType: "swap",
      referenceId: "swap_102",
      idempotencyKey: "hold_swap_102",
    });

    expect(excessHoldRes.result.success).toBe(false);
    expect(excessHoldRes.result.code).toBe("INSUFFICIENT_CREDITS");
    expect(excessHoldRes.state.accounts[userId].available).toBe(3);
    expect(excessHoldRes.state.accounts[userId].held).toBe(2);

    // Zero or negative hold rejection
    const invalidHold = createCreditHold(holdRes.state, {
      userId,
      amount: 0,
      referenceType: "swap",
      referenceId: "swap_103",
      idempotencyKey: "hold_swap_103",
    });
    expect(invalidHold.result.success).toBe(false);
    expect(invalidHold.result.code).toBe("INVALID_AMOUNT");
  });

  it("Holds: capture, release, expiration, double release/capture prevention", () => {
    let state = createEmptyCreditState();
    const userId = "u_hold_life";
    state = grantInitialCredits(state, userId, "grant_hold_life").state;

    const holdRes = createCreditHold(state, {
      userId,
      amount: 2,
      referenceType: "swap",
      referenceId: "swap_life_1",
      idempotencyKey: "hold_life_1",
    });
    state = holdRes.state;

    // Release hold
    const releaseRes = releaseCreditHold(state, {
      referenceId: "swap_life_1",
      idempotencyKey: "release_life_1",
    });
    state = releaseRes.state;
    expect(releaseRes.result.success).toBe(true);
    expect(state.accounts[userId].available).toBe(5);
    expect(state.accounts[userId].held).toBe(0);

    // Double release should fail or return idempotent replay
    const doubleRelease = releaseCreditHold(state, {
      referenceId: "swap_life_1",
      idempotencyKey: "release_life_2",
    });
    expect(doubleRelease.result.success).toBe(false);
    expect(doubleRelease.result.code).toBe("HOLD_NOT_FOUND");
  });

  it("State Machine: strict valid transitions and invalid transition rejection", () => {
    expect(canTransitionSwapStatus("pending", "accepted")).toBe(true);
    expect(canTransitionSwapStatus("pending", "declined")).toBe(true);
    expect(canTransitionSwapStatus("accepted", "active")).toBe(true);
    expect(canTransitionSwapStatus("accepted", "cancelled")).toBe(true);
    expect(canTransitionSwapStatus("active", "waiting_for_completion")).toBe(true);
    expect(canTransitionSwapStatus("waiting_for_completion", "completed")).toBe(true);

    // Illegal transitions
    expect(canTransitionSwapStatus("pending", "completed")).toBe(false);
    expect(canTransitionSwapStatus("declined", "active")).toBe(false);
    expect(canTransitionSwapStatus("cancelled", "accepted")).toBe(false);
    expect(canTransitionSwapStatus("completed", "cancelled")).toBe(false);
    expect(canTransitionSwapStatus("completed", "completed")).toBe(false);
  });

  it("Scenario A: Successful exchange with two-party confirmation & atomic settlement", () => {
    let state = createEmptyCreditState();
    const learnerId = "learner_A";
    const teacherId = "teacher_A";

    state = grantInitialCredits(state, learnerId, "grant_learner_A").state;
    state = grantInitialCredits(state, teacherId, "grant_teacher_A").state;

    const swap: SkillSwapRequest = {
      id: "swap_scen_A",
      requesterId: learnerId,
      recipientId: teacherId,
      offeredSkillId: "python",
      requestedSkillId: "design",
      message: "Hello",
      preferredFormat: "remote",
      requiredCredits: 2,
      status: "active",
      createdAt: "2026-08-01",
      updatedAt: "2026-08-01",
    };

    // Hold credits for learner upon acceptance
    state = createCreditHold(state, {
      userId: learnerId,
      amount: 2,
      referenceType: "swap",
      referenceId: swap.id,
      idempotencyKey: `swap:${swap.id}:hold`,
    }).state;

    expect(state.accounts[learnerId].available).toBe(3);
    expect(state.accounts[learnerId].held).toBe(2);

    // Party A (learner) confirms
    const confirm1 = confirmSwapCompletion(state, {
      swapRequest: swap,
      completedByUserId: learnerId,
    });
    expect(confirm1.result.success).toBe(true);
    expect(confirm1.result.data?.settled).toBe(false);
    expect(confirm1.result.data?.swapRequest.status).toBe("waiting_for_completion");
    state = confirm1.state;

    // Party B (teacher) confirms -> Settles atomically
    const confirm2 = confirmSwapCompletion(state, {
      swapRequest: confirm1.result.data!.swapRequest,
      completedByUserId: teacherId,
    });
    expect(confirm2.result.success).toBe(true);
    expect(confirm2.result.data?.settled).toBe(true);
    expect(confirm2.result.data?.swapRequest.status).toBe("completed");
    state = confirm2.state;

    expect(state.accounts[learnerId].available).toBe(3);
    expect(state.accounts[learnerId].held).toBe(0);
    expect(state.accounts[teacherId].available).toBe(7);

    const valSys = validateEntireCreditSystem(state);
    expect(valSys.valid).toBe(true);
  });

  it("Scenario B: Insufficient credits prevents hold creation & acceptance", () => {
    let state = createEmptyCreditState();
    const learnerId = "learner_B";
    state = grantInitialCredits(state, learnerId, "grant_B").state;
    // Reduce balance to 1
    state.accounts[learnerId].available = 1;

    const holdRes = createCreditHold(state, {
      userId: learnerId,
      amount: 2,
      referenceType: "swap",
      referenceId: "swap_scen_B",
      idempotencyKey: "hold_B",
    });

    expect(holdRes.result.success).toBe(false);
    expect(holdRes.result.code).toBe("INSUFFICIENT_CREDITS");
    expect(holdRes.state.accounts[learnerId].available).toBe(1);
    expect(holdRes.state.accounts[learnerId].held).toBe(0);
  });

  it("Scenario C: Cancellation releases active hold without rewarding teacher", () => {
    let state = createEmptyCreditState();
    const learnerId = "learner_C";
    const teacherId = "teacher_C";

    state = grantInitialCredits(state, learnerId, "grant_learner_C").state;
    state = grantInitialCredits(state, teacherId, "grant_teacher_C").state;

    // Hold 2 credits
    state = createCreditHold(state, {
      userId: learnerId,
      amount: 2,
      referenceType: "swap",
      referenceId: "swap_scen_C",
      idempotencyKey: "hold_C",
    }).state;

    expect(state.accounts[learnerId].available).toBe(3);

    // Cancel swap -> release hold
    const releaseRes = releaseCreditHold(state, {
      referenceId: "swap_scen_C",
      idempotencyKey: "release_C",
    });
    state = releaseRes.state;

    expect(state.accounts[learnerId].available).toBe(5);
    expect(state.accounts[learnerId].held).toBe(0);
    expect(state.accounts[teacherId].available).toBe(5);
  });

  it("Scenario D: Hold expiration releases funds deterministically", () => {
    let state = createEmptyCreditState();
    const learnerId = "learner_D";
    state = grantInitialCredits(state, learnerId, "grant_D").state;

    state = createCreditHold(state, {
      userId: learnerId,
      amount: 2,
      referenceType: "swap",
      referenceId: "swap_scen_D",
      idempotencyKey: "hold_D",
    }, "2026-08-01T00:00:00.000Z").state;

    expect(state.accounts[learnerId].available).toBe(3);
    expect(state.accounts[learnerId].held).toBe(2);

    // Advance 15 days (expiration policy is 14 days)
    const futureDate = "2026-08-16T00:00:00.000Z";
    state = checkAndExpireHolds(state, futureDate);

    expect(state.accounts[learnerId].available).toBe(5);
    expect(state.accounts[learnerId].held).toBe(0);
    expect(state.holds.find((h) => h.referenceId === "swap_scen_D")?.status).toBe("expired");
  });

  it("Scenario E: Duplicate completion call 10 times is idempotent", () => {
    let state = createEmptyCreditState();
    const learnerId = "learner_E";
    const teacherId = "teacher_E";

    state = grantInitialCredits(state, learnerId, "grant_learner_E").state;
    state = grantInitialCredits(state, teacherId, "grant_teacher_E").state;

    const swap: SkillSwapRequest = {
      id: "swap_scen_E",
      requesterId: learnerId,
      recipientId: teacherId,
      offeredSkillId: "python",
      requestedSkillId: "design",
      message: "Test",
      preferredFormat: "remote",
      requiredCredits: 2,
      status: "active",
      requesterConfirmedAt: "2026-08-01T10:00:00.000Z",
      createdAt: "2026-08-01",
      updatedAt: "2026-08-01",
    };

    state = createCreditHold(state, {
      userId: learnerId,
      amount: 2,
      referenceType: "swap",
      referenceId: swap.id,
      idempotencyKey: `swap:${swap.id}:hold`,
    }).state;

    let res;
    for (let i = 0; i < 10; i++) {
      res = settleExchange(state, { swapRequest: swap });
      if (res.result.success) {
        state = res.state;
      }
    }

    expect(state.accounts[learnerId].available).toBe(3);
    expect(state.accounts[learnerId].held).toBe(0);
    expect(state.accounts[teacherId].available).toBe(7);

    const captures = state.transactions.filter((t) => t.type === "hold_capture" && t.referenceId === swap.id);
    const rewards = state.transactions.filter((t) => t.type === "teaching_reward" && t.referenceId === swap.id);

    expect(captures.length).toBe(1);
    expect(rewards.length).toBe(1);
  });

  it("Scenario F: Malicious completion by non-participant fails with UNAUTHORIZED", () => {
    let state = createEmptyCreditState();
    const learnerId = "learner_F";
    const teacherId = "teacher_F";
    const attackerId = "attacker_999";

    state = grantInitialCredits(state, learnerId, "grant_learner_F").state;
    state = grantInitialCredits(state, teacherId, "grant_teacher_F").state;

    const swap: SkillSwapRequest = {
      id: "swap_scen_F",
      requesterId: learnerId,
      recipientId: teacherId,
      offeredSkillId: "python",
      requestedSkillId: "design",
      message: "Test",
      preferredFormat: "remote",
      status: "active",
      createdAt: "2026-08-01",
      updatedAt: "2026-08-01",
    };

    const confirmRes = confirmSwapCompletion(state, {
      swapRequest: swap,
      completedByUserId: attackerId,
    });

    expect(confirmRes.result.success).toBe(false);
    expect(confirmRes.result.code).toBe("UNAUTHORIZED");
  });

  it("Scenario G & Self-Swap: Missing hold fails settlement, self-swap rejected", () => {
    let state = createEmptyCreditState();
    const learnerId = "learner_G";
    const teacherId = "teacher_G";

    state = grantInitialCredits(state, learnerId, "grant_G1").state;
    state = grantInitialCredits(state, teacherId, "grant_G2").state;

    const swapNoHold: SkillSwapRequest = {
      id: "swap_no_hold",
      requesterId: learnerId,
      recipientId: teacherId,
      offeredSkillId: "python",
      requestedSkillId: "design",
      message: "No hold swap",
      preferredFormat: "remote",
      requiredCredits: 2,
      status: "active",
      createdAt: "2026-08-01",
      updatedAt: "2026-08-01",
    };

    const settleRes = settleExchange(state, { swapRequest: swapNoHold });
    expect(settleRes.result.success).toBe(false);
    expect(settleRes.result.code).toBe("MISSING_CREDIT_HOLD");

    // Self swap check
    const selfSwap: SkillSwapRequest = {
      id: "swap_self",
      requesterId: learnerId,
      recipientId: learnerId,
      offeredSkillId: "python",
      requestedSkillId: "python",
      message: "Self swap",
      preferredFormat: "remote",
      status: "pending",
      createdAt: "2026-08-01",
      updatedAt: "2026-08-01",
    };
    const selfRes = settleExchange(state, { swapRequest: selfSwap });
    expect(selfRes.result.success).toBe(false);
    expect(selfRes.result.code).toBe("SELF_SWAP_NOT_ALLOWED");
  });

  it("Refunds: traceable refund referencing original settlement transaction", () => {
    let state = createEmptyCreditState();
    const learnerId = "learner_R";
    const teacherId = "teacher_R";

    state = grantInitialCredits(state, learnerId, "grant_R1").state;
    state = grantInitialCredits(state, teacherId, "grant_R2").state;

    const swap: SkillSwapRequest = {
      id: "swap_refund_1",
      requesterId: learnerId,
      recipientId: teacherId,
      offeredSkillId: "python",
      requestedSkillId: "design",
      message: "Refund test",
      preferredFormat: "remote",
      requiredCredits: 2,
      status: "active",
      createdAt: "2026-08-01",
      updatedAt: "2026-08-01",
    };

    state = createCreditHold(state, {
      userId: learnerId,
      amount: 2,
      referenceType: "swap",
      referenceId: swap.id,
      idempotencyKey: `swap:${swap.id}:hold`,
    }).state;

    // Settle
    state = settleExchange(state, { swapRequest: swap }).state;

    // Refund
    const refRes = refundExchange(state, {
      swapId: swap.id,
      requestedByUserId: learnerId,
      description: "Exchange issue refund",
    });

    expect(refRes.result.success).toBe(true);
    state = refRes.state;

    expect(state.accounts[learnerId].available).toBe(5);
    expect(state.accounts[learnerId].lifetimeRefunded).toBe(2);

    const refTx = state.transactions.find((t) => t.type === "cancellation_refund");
    expect(refTx).toBeDefined();
    expect(refTx?.reversesTransactionId).toBeDefined();

    // Duplicate refund is idempotent
    const dupRefRes = refundExchange(state, {
      swapId: swap.id,
      requestedByUserId: learnerId,
    });
    expect(dupRefRes.result.code).toBe("IDEMPOTENT_REPLAY");
  });
});
