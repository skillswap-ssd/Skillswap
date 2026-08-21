import {
  awardCredits,
  captureCreditHold,
  completeSkillSwapAtomic,
  createCreditHold,
  createEmptyCreditState,
  getCreditAudit,
  grantInitialCredits,
  refundCredits,
  releaseCreditHold,
} from "./credit-engine";
import { CREDIT_RULES } from "./credit-rules";
import { validateCreditAccount, validateEntireCreditSystem } from "./credit-validation";
import type { SkillSwapRequest } from "@/data/models";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

export function runCreditEngineTests() {
  console.log("Starting Credit Engine Tests...");

  // Test 1: Account Creation & Initial Grant Idempotency
  {
    let state = createEmptyCreditState();
    const userId = "test_user_1";

    const res1 = grantInitialCredits(state, userId, "grant_1");
    assert(res1.result.success, "Initial grant 1 should succeed");
    assert(res1.state.accounts[userId].available === CREDIT_RULES.INITIAL_CREDITS, "Available should match initial credits");

    // Idempotent re-run
    const res2 = grantInitialCredits(res1.state, userId, "grant_1");
    assert(res2.result.code === "IDEMPOTENT_REPLAY", "Second grant should be detected as idempotent replay");
    assert(res2.state.accounts[userId].available === CREDIT_RULES.INITIAL_CREDITS, "Available balance must not increase on replay");
    assert(res2.state.transactions.length === 1, "Only 1 transaction should exist");

    const validation = validateCreditAccount(res2.state, userId);
    assert(validation.valid, `Account validation failed: ${validation.errors.join(", ")}`);
  }

  // Test 2: Spending & Hold Creation
  {
    let state = createEmptyCreditState();
    const userId = "test_user_2";
    state = grantInitialCredits(state, userId, "grant_2").state;

    // Create Hold of 2 credits
    const holdRes = createCreditHold(state, {
      userId,
      amount: 2,
      referenceType: "swap",
      referenceId: "swap_101",
      idempotencyKey: "hold_swap_101",
    });

    assert(holdRes.result.success, "Hold creation should succeed");
    assert(holdRes.state.accounts[userId].available === 3, "Available should decrease from 5 to 3");
    assert(holdRes.state.accounts[userId].held === 2, "Held balance should increase to 2");

    // Attempt to hold more than available (available is 3, requesting 5)
    const excessHoldRes = createCreditHold(holdRes.state, {
      userId,
      amount: 5,
      referenceType: "swap",
      referenceId: "swap_102",
      idempotencyKey: "hold_swap_102",
    });

    assert(!excessHoldRes.result.success, "Excess hold should be rejected");
    assert(excessHoldRes.result.code === "INSUFFICIENT_CREDITS", "Should return INSUFFICIENT_CREDITS code");
    assert(excessHoldRes.state.accounts[userId].available === 3, "Available balance must remain unchanged");
    assert(excessHoldRes.state.accounts[userId].held === 2, "Held balance must remain unchanged");
  }

  // Test 3: Hold Capture & Reward (Successful Exchange)
  {
    let state = createEmptyCreditState();
    const learnerId = "learner_1";
    const teacherId = "teacher_1";

    state = grantInitialCredits(state, learnerId, "grant_learner").state;
    state = grantInitialCredits(state, teacherId, "grant_teacher").state;

    // Hold 2 credits for learner
    const holdRes = createCreditHold(state, {
      userId: learnerId,
      amount: 2,
      referenceType: "swap",
      referenceId: "swap_exchange_1",
      idempotencyKey: "hold_exchange_1",
    });
    state = holdRes.state;

    // Capture hold
    const activeHold = state.holds.find((h) => h.referenceId === "swap_exchange_1");
    assert(Boolean(activeHold), "Active hold should exist");

    const captureRes = captureCreditHold(state, {
      holdId: activeHold!.id,
      idempotencyKey: "capture_exchange_1",
    });
    state = captureRes.state;

    assert(captureRes.result.success, "Capture should succeed");
    assert(state.accounts[learnerId].available === 3, "Learner available should remain 3");
    assert(state.accounts[learnerId].held === 0, "Learner held should return to 0");
    assert(state.accounts[learnerId].lifetimeSpent === 2, "Learner lifetime spent should increase to 2");

    // Award Teacher
    const awardRes = awardCredits(state, {
      userId: teacherId,
      amount: 2,
      referenceType: "swap",
      referenceId: "swap_exchange_1",
      description: "Teaching reward",
      idempotencyKey: "teacher_reward_exchange_1",
    });
    state = awardRes.state;

    assert(state.accounts[teacherId].available === 7, "Teacher available should increase from 5 to 7");
    assert(state.accounts[teacherId].lifetimeEarned === 7, "Teacher lifetime earned should be 7");

    const sysVal = validateEntireCreditSystem(state);
    assert(sysVal.valid, `System validation failed: ${sysVal.errors.join(", ")}`);
  }

  // Test 4: Hold Release on Cancellation
  {
    let state = createEmptyCreditState();
    const userId = "cancel_user_1";
    state = grantInitialCredits(state, userId, "grant_cancel").state;

    const holdRes = createCreditHold(state, {
      userId,
      amount: 2,
      referenceType: "swap",
      referenceId: "swap_cancel_1",
      idempotencyKey: "hold_cancel_1",
    });
    state = holdRes.state;

    assert(state.accounts[userId].available === 3, "Available should be 3 during hold");

    const releaseRes = releaseCreditHold(state, {
      referenceId: "swap_cancel_1",
      idempotencyKey: "release_cancel_1",
    });
    state = releaseRes.state;

    assert(releaseRes.result.success, "Release should succeed");
    assert(state.accounts[userId].available === 5, "Available should return to 5 after release");
    assert(state.accounts[userId].held === 0, "Held should return to 0");
  }

  // Test 5: Atomic Swap Completion & Replay Immunity
  {
    let state = createEmptyCreditState();
    const requesterId = "req_1";
    const recipientId = "rec_1";

    state = grantInitialCredits(state, requesterId, "grant_req").state;
    state = grantInitialCredits(state, recipientId, "grant_rec").state;

    const mockSwap: SkillSwapRequest = {
      id: "atomic_swap_1",
      requesterId,
      recipientId,
      offeredSkillId: "python",
      requestedSkillId: "photo",
      message: "Test swap",
      preferredFormat: "remote",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Hold credits for requester
    state = createCreditHold(state, {
      userId: requesterId,
      amount: 2,
      referenceType: "swap",
      referenceId: mockSwap.id,
      idempotencyKey: "hold_atomic_swap_1",
    }).state;

    // Call atomic completion 3 times in a row (simulate multi-click / re-renders)
    const run1 = completeSkillSwapAtomic(state, { swapRequest: mockSwap, completedByUserId: requesterId });
    const run2 = completeSkillSwapAtomic(run1.state, { swapRequest: mockSwap, completedByUserId: requesterId });
    const run3 = completeSkillSwapAtomic(run2.state, { swapRequest: mockSwap, completedByUserId: requesterId });

    assert(run1.result.success, "Run 1 completion should succeed");
    assert(run3.state.accounts[requesterId].available === 3, "Requester available balance must be exactly 3 after multiple retries");
    assert(run3.state.accounts[recipientId].available === 7, "Recipient available balance must be exactly 7 after multiple retries");

    const auditReq = getCreditAudit(run3.state, requesterId);
    assert(auditReq.reconciled, "Requester audit must be fully reconciled");
    const auditRec = getCreditAudit(run3.state, recipientId);
    assert(auditRec.reconciled, "Recipient audit must be fully reconciled");
  }

  console.log("All Credit Engine Tests Passed Successfully! ✓");
}
