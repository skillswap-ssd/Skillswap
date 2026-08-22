import type { ID, SkillSwapRequest, SwapStatus } from "@/data/models";
import { CREDIT_RULES } from "./credit-rules";
import type {
  CreditAccount,
  CreditAuditLog,
  CreditErrorCode,
  CreditHold,
  CreditOperationResult,
  CreditTransaction,
} from "./credit-types";
import { buildIdempotencyKey, generateId } from "./credit-utils";

export interface CreditEngineState {
  accounts: Record<ID, CreditAccount>;
  transactions: CreditTransaction[];
  holds: CreditHold[];
}

export function createEmptyCreditState(): CreditEngineState {
  return {
    accounts: {},
    transactions: [],
    holds: [],
  };
}

export function canTransitionSwapStatus(from: SwapStatus, to: SwapStatus): boolean {
  if (from === to) return false;

  switch (from) {
    case "pending":
      return to === "accepted" || to === "declined";
    case "accepted":
      return to === "active" || to === "cancelled";
    case "active":
      return to === "waiting_for_completion" || to === "cancelled";
    case "waiting_for_completion":
      return to === "completed" || to === "cancelled";
    case "completed":
    case "declined":
    case "cancelled":
      return false; // Terminal states
    default:
      return false;
  }
}

export function getOrCreateAccount(
  state: CreditEngineState,
  userId: ID,
  nowIso = new Date().toISOString()
): { state: CreditEngineState; account: CreditAccount; isNew: boolean } {
  let account = state.accounts[userId];
  if (account) {
    return { state, account, isNew: false };
  }

  account = {
    userId,
    available: 0,
    held: 0,
    lifetimeEarned: 0,
    lifetimeSpent: 0,
    lifetimeRefunded: 0,
    version: 1,
    updatedAt: nowIso,
  };

  const nextAccounts = { ...state.accounts, [userId]: account };
  const nextState = { ...state, accounts: nextAccounts };

  // Issue initial grant idempotently
  const initialGrantKey = buildIdempotencyKey("initial_grant", userId);
  const grantResult = grantInitialCredits(nextState, userId, initialGrantKey, nowIso);

  return {
    state: grantResult.state,
    account: grantResult.state.accounts[userId] || account,
    isNew: true,
  };
}

export function grantInitialCredits(
  state: CreditEngineState,
  userId: ID,
  idempotencyKey: string = buildIdempotencyKey("initial_grant", userId),
  nowIso = new Date().toISOString()
): { state: CreditEngineState; result: CreditOperationResult<CreditTransaction> } {
  // Idempotency check
  const existingTx = state.transactions.find((t) => t.idempotencyKey === idempotencyKey);
  if (existingTx) {
    return {
      state,
      result: {
        success: true,
        code: "IDEMPOTENT_REPLAY",
        message: "Initial credits already granted",
        data: existingTx,
      },
    };
  }

  const currentAccount = state.accounts[userId] || {
    userId,
    available: 0,
    held: 0,
    lifetimeEarned: 0,
    lifetimeSpent: 0,
    lifetimeRefunded: 0,
    version: 0,
    updatedAt: nowIso,
  };

  const amount = CREDIT_RULES.INITIAL_CREDITS;

  const transaction: CreditTransaction = {
    id: generateId("tx"),
    userId,
    amount,
    type: "initial_grant",
    direction: "credit",
    status: "completed",
    referenceType: "system",
    referenceId: "welcome",
    description: "Welcome credit allocation",
    createdAt: nowIso,
    idempotencyKey,
  };

  const updatedAccount: CreditAccount = {
    ...currentAccount,
    available: currentAccount.available + amount,
    lifetimeEarned: currentAccount.lifetimeEarned + amount,
    version: currentAccount.version + 1,
    updatedAt: nowIso,
  };

  return {
    state: {
      accounts: { ...state.accounts, [userId]: updatedAccount },
      transactions: [transaction, ...state.transactions],
      holds: state.holds,
    },
    result: {
      success: true,
      code: "SUCCESS",
      message: "Initial credits granted",
      data: transaction,
    },
  };
}

export function createCreditHold(
  state: CreditEngineState,
  params: {
    userId: ID;
    amount: number;
    referenceType: "swap" | "session" | "system";
    referenceId?: ID;
    idempotencyKey: string;
    description?: string;
  },
  nowIso = new Date().toISOString()
): { state: CreditEngineState; result: CreditOperationResult<CreditHold> } {
  const { userId, amount, referenceType, referenceId, idempotencyKey, description } = params;

  if (amount <= 0) {
    return {
      state,
      result: {
        success: false,
        code: "INVALID_AMOUNT",
        message: "Hold amount must be positive",
      },
    };
  }

  // Idempotency check
  const existingHold = state.holds.find((h) => h.idempotencyKey === idempotencyKey);
  if (existingHold) {
    return {
      state,
      result: {
        success: true,
        code: "IDEMPOTENT_REPLAY",
        message: "Credit hold already created",
        data: existingHold,
      },
    };
  }

  const account = state.accounts[userId];
  const available = account ? account.available : 0;

  if (available < amount) {
    return {
      state,
      result: {
        success: false,
        code: "INSUFFICIENT_CREDITS",
        message: `Insufficient available credits. Required: ${amount}, Available: ${available}`,
        required: amount,
        available,
      },
    };
  }

  const expiresDate = new Date(nowIso);
  expiresDate.setDate(expiresDate.getDate() + CREDIT_RULES.HOLD_EXPIRATION_DAYS);

  const hold: CreditHold = {
    id: generateId("hold"),
    userId,
    amount,
    referenceType,
    referenceId,
    status: "active",
    createdAt: nowIso,
    updatedAt: nowIso,
    expiresAt: expiresDate.toISOString(),
    idempotencyKey,
  };

  const holdTx: CreditTransaction = {
    id: generateId("tx"),
    userId,
    amount,
    type: "hold",
    direction: "debit",
    status: "completed",
    referenceType,
    referenceId,
    description: description || `Credits held for ${referenceType}`,
    createdAt: nowIso,
    idempotencyKey: buildIdempotencyKey(idempotencyKey, "tx"),
  };

  const updatedAccount: CreditAccount = {
    ...account,
    available: account.available - amount,
    held: account.held + amount,
    version: account.version + 1,
    updatedAt: nowIso,
  };

  return {
    state: {
      accounts: { ...state.accounts, [userId]: updatedAccount },
      transactions: [holdTx, ...state.transactions],
      holds: [hold, ...state.holds],
    },
    result: {
      success: true,
      code: "SUCCESS",
      message: "Credit hold created",
      data: hold,
    },
  };
}

export function captureCreditHold(
  state: CreditEngineState,
  params: {
    holdId?: ID;
    idempotencyKey: string;
    description?: string;
  },
  nowIso = new Date().toISOString()
): { state: CreditEngineState; result: CreditOperationResult<CreditTransaction> } {
  const { holdId, idempotencyKey, description } = params;

  // Idempotency check
  const existingTx = state.transactions.find((t) => t.idempotencyKey === idempotencyKey);
  if (existingTx) {
    return {
      state,
      result: {
        success: true,
        code: "IDEMPOTENT_REPLAY",
        message: "Hold capture already processed",
        data: existingTx,
      },
    };
  }

  const hold = state.holds.find(
    (h) => h.id === holdId || h.idempotencyKey === params.idempotencyKey || (holdId && h.referenceId === holdId)
  );
  if (!hold) {
    return {
      state,
      result: {
        success: false,
        code: "HOLD_NOT_FOUND",
        message: "Active hold not found",
      },
    };
  }

  if (hold.status !== "active") {
    return {
      state,
      result: {
        success: false,
        code: "INVALID_STATE",
        message: `Hold is already ${hold.status}`,
      },
    };
  }

  const account = state.accounts[hold.userId];
  if (!account) {
    return {
      state,
      result: {
        success: false,
        code: "USER_NOT_FOUND",
        message: "Account not found for hold user",
      },
    };
  }

  const captureTx: CreditTransaction = {
    id: generateId("tx"),
    userId: hold.userId,
    amount: hold.amount,
    type: "hold_capture",
    direction: "debit",
    status: "completed",
    referenceType: hold.referenceType,
    referenceId: hold.referenceId,
    description: description || `Captured credits for completed exchange`,
    createdAt: nowIso,
    idempotencyKey,
  };

  const updatedHold: CreditHold = {
    ...hold,
    status: "captured",
    updatedAt: nowIso,
  };

  const updatedAccount: CreditAccount = {
    ...account,
    held: Math.max(0, account.held - hold.amount),
    lifetimeSpent: account.lifetimeSpent + hold.amount,
    version: account.version + 1,
    updatedAt: nowIso,
  };

  return {
    state: {
      accounts: { ...state.accounts, [hold.userId]: updatedAccount },
      transactions: [captureTx, ...state.transactions],
      holds: state.holds.map((h) => (h.id === hold.id ? updatedHold : h)),
    },
    result: {
      success: true,
      code: "SUCCESS",
      message: "Hold captured successfully",
      data: captureTx,
    },
  };
}

export function releaseCreditHold(
  state: CreditEngineState,
  params: {
    holdId?: ID;
    referenceId?: ID;
    idempotencyKey: string;
    description?: string;
  },
  nowIso = new Date().toISOString()
): { state: CreditEngineState; result: CreditOperationResult<CreditTransaction> } {
  const { holdId, referenceId, idempotencyKey, description } = params;

  // Idempotency check
  const existingTx = state.transactions.find((t) => t.idempotencyKey === idempotencyKey);
  if (existingTx) {
    return {
      state,
      result: {
        success: true,
        code: "IDEMPOTENT_REPLAY",
        message: "Hold release already processed",
        data: existingTx,
      },
    };
  }

  const hold = state.holds.find(
    (h) => (holdId && h.id === holdId) || (referenceId && h.referenceId === referenceId && h.status === "active")
  );

  if (!hold) {
    return {
      state,
      result: {
        success: false,
        code: "HOLD_NOT_FOUND",
        message: "Active hold not found for release",
      },
    };
  }

  if (hold.status !== "active") {
    return {
      state,
      result: {
        success: false,
        code: "INVALID_STATE",
        message: `Hold is already ${hold.status}`,
      },
    };
  }

  const account = state.accounts[hold.userId];
  if (!account) {
    return {
      state,
      result: {
        success: false,
        code: "USER_NOT_FOUND",
        message: "Account not found for hold user",
      },
    };
  }

  const releaseTx: CreditTransaction = {
    id: generateId("tx"),
    userId: hold.userId,
    amount: hold.amount,
    type: "hold_release",
    direction: "credit",
    status: "completed",
    referenceType: hold.referenceType,
    referenceId: hold.referenceId,
    description: description || `Released held credits due to cancellation`,
    createdAt: nowIso,
    idempotencyKey,
  };

  const updatedHold: CreditHold = {
    ...hold,
    status: "released",
    updatedAt: nowIso,
  };

  const updatedAccount: CreditAccount = {
    ...account,
    available: account.available + hold.amount,
    held: Math.max(0, account.held - hold.amount),
    version: account.version + 1,
    updatedAt: nowIso,
  };

  return {
    state: {
      accounts: { ...state.accounts, [hold.userId]: updatedAccount },
      transactions: [releaseTx, ...state.transactions],
      holds: state.holds.map((h) => (h.id === hold.id ? updatedHold : h)),
    },
    result: {
      success: true,
      code: "SUCCESS",
      message: "Hold released successfully",
      data: releaseTx,
    },
  };
}

export function checkAndExpireHolds(
  state: CreditEngineState,
  nowIso = new Date().toISOString()
): CreditEngineState {
  let currentState = state;
  const nowTime = new Date(nowIso).getTime();

  for (const hold of state.holds) {
    if (hold.status === "active" && hold.expiresAt) {
      if (new Date(hold.expiresAt).getTime() <= nowTime) {
        const releaseKey = buildIdempotencyKey("hold_expired", hold.id);
        const account = currentState.accounts[hold.userId];
        if (!account) continue;

        const releaseTx: CreditTransaction = {
          id: generateId("tx"),
          userId: hold.userId,
          amount: hold.amount,
          type: "expired_release",
          direction: "credit",
          status: "completed",
          referenceType: hold.referenceType,
          referenceId: hold.referenceId,
          description: `Released held credits due to expiration after ${CREDIT_RULES.HOLD_EXPIRATION_DAYS} days`,
          createdAt: nowIso,
          idempotencyKey: releaseKey,
        };

        const updatedHold: CreditHold = {
          ...hold,
          status: "expired",
          updatedAt: nowIso,
        };

        const updatedAccount: CreditAccount = {
          ...account,
          available: account.available + hold.amount,
          held: Math.max(0, account.held - hold.amount),
          version: account.version + 1,
          updatedAt: nowIso,
        };

        currentState = {
          accounts: { ...currentState.accounts, [hold.userId]: updatedAccount },
          transactions: [releaseTx, ...currentState.transactions],
          holds: currentState.holds.map((h) => (h.id === hold.id ? updatedHold : h)),
        };
      }
    }
  }

  return currentState;
}

export function awardCredits(
  state: CreditEngineState,
  params: {
    userId: ID;
    amount: number;
    referenceType: "swap" | "session" | "system" | "admin";
    referenceId?: ID;
    description: string;
    idempotencyKey: string;
    type?: "teaching_reward" | "bonus" | "adjustment";
  },
  nowIso = new Date().toISOString()
): { state: CreditEngineState; result: CreditOperationResult<CreditTransaction> } {
  const { userId, amount, referenceType, referenceId, description, idempotencyKey, type = "teaching_reward" } = params;

  if (amount <= 0) {
    return {
      state,
      result: {
        success: false,
        code: "INVALID_AMOUNT",
        message: "Award amount must be positive",
      },
    };
  }

  // Idempotency check
  const existingTx = state.transactions.find((t) => t.idempotencyKey === idempotencyKey);
  if (existingTx) {
    return {
      state,
      result: {
        success: true,
        code: "IDEMPOTENT_REPLAY",
        message: "Credits already awarded",
        data: existingTx,
      },
    };
  }

  const account = state.accounts[userId] || {
    userId,
    available: 0,
    held: 0,
    lifetimeEarned: 0,
    lifetimeSpent: 0,
    lifetimeRefunded: 0,
    version: 0,
    updatedAt: nowIso,
  };

  const rewardTx: CreditTransaction = {
    id: generateId("tx"),
    userId,
    amount,
    type,
    direction: "credit",
    status: "completed",
    referenceType,
    referenceId,
    description,
    createdAt: nowIso,
    idempotencyKey,
  };

  const updatedAccount: CreditAccount = {
    ...account,
    available: account.available + amount,
    lifetimeEarned: account.lifetimeEarned + amount,
    version: account.version + 1,
    updatedAt: nowIso,
  };

  return {
    state: {
      accounts: { ...state.accounts, [userId]: updatedAccount },
      transactions: [rewardTx, ...state.transactions],
      holds: state.holds,
    },
    result: {
      success: true,
      code: "SUCCESS",
      message: "Credits awarded successfully",
      data: rewardTx,
    },
  };
}

export function settleExchange(
  state: CreditEngineState,
  params: {
    swapRequest: SkillSwapRequest;
    nowIso?: string;
  }
): { state: CreditEngineState; result: CreditOperationResult<{ settlementId: string }> } {
  const { swapRequest, nowIso = new Date().toISOString() } = params;

  if (!swapRequest) {
    return {
      state,
      result: {
        success: false,
        code: "SWAP_NOT_FOUND",
        message: "SkillSwap request not found",
      },
    };
  }

  if (swapRequest.requesterId === swapRequest.recipientId) {
    return {
      state,
      result: {
        success: false,
        code: "SELF_SWAP_NOT_ALLOWED",
        message: "Self-swaps are not allowed",
      },
    };
  }

  const settlementId = `settlement:${swapRequest.id}`;
  const learnerCaptureKey = `${settlementId}:learner_capture`;
  const teacherRewardKey = `${settlementId}:teacher_reward`;

  // Check idempotency: if settlement transactions already exist
  const existingCapture = state.transactions.find((t) => t.idempotencyKey === learnerCaptureKey);
  const existingReward = state.transactions.find((t) => t.idempotencyKey === teacherRewardKey);

  if (existingCapture && existingReward) {
    return {
      state,
      result: {
        success: true,
        code: "IDEMPOTENT_REPLAY",
        message: "Exchange already settled",
        data: { settlementId },
      },
    };
  }

  const requiredCredits = swapRequest.requiredCredits || CREDIT_RULES.CREDITS_PER_SWAP;
  const learnerId = swapRequest.requesterId;
  const teacherId = swapRequest.recipientId;

  // Validate Hold Existence
  const activeHold = state.holds.find(
    (h) => h.referenceId === swapRequest.id && h.userId === learnerId && h.status === "active"
  );

  if (!activeHold) {
    return {
      state,
      result: {
        success: false,
        code: "MISSING_CREDIT_HOLD",
        message: "Cannot settle exchange: No active credit hold found for learner",
      },
    };
  }

  if (activeHold.amount !== requiredCredits) {
    return {
      state,
      result: {
        success: false,
        code: "SETTLEMENT_AMOUNT_MISMATCH",
        message: `Hold amount (${activeHold.amount}) does not match required credits (${requiredCredits})`,
      },
    };
  }

  // Atomic Settlement Execution
  // 1. Capture Learner Hold
  const captureRes = captureCreditHold(
    state,
    {
      holdId: activeHold.id,
      idempotencyKey: learnerCaptureKey,
      description: `Settled exchange payment for swap #${swapRequest.id} (ref: ${settlementId})`,
    },
    nowIso
  );

  if (!captureRes.result.success && captureRes.result.code !== "IDEMPOTENT_REPLAY") {
    return { state, result: { success: false, code: captureRes.result.code, message: captureRes.result.message } };
  }

  // 2. Reward Teacher
  const awardRes = awardCredits(
    captureRes.state,
    {
      userId: teacherId,
      amount: requiredCredits,
      referenceType: "swap",
      referenceId: swapRequest.id,
      description: `Settled teaching reward for swap #${swapRequest.id} (ref: ${settlementId})`,
      idempotencyKey: teacherRewardKey,
      type: "teaching_reward",
    },
    nowIso
  );

  if (!awardRes.result.success && awardRes.result.code !== "IDEMPOTENT_REPLAY") {
    return { state, result: { success: false, code: awardRes.result.code, message: awardRes.result.message } };
  }

  return {
    state: awardRes.state,
    result: {
      success: true,
      code: "SUCCESS",
      message: "Exchange settled atomically",
      data: { settlementId },
    },
  };
}

export function confirmSwapCompletion(
  state: CreditEngineState,
  params: {
    swapRequest: SkillSwapRequest;
    completedByUserId: ID;
    nowIso?: string;
  }
): { state: CreditEngineState; result: CreditOperationResult<{ swapRequest: SkillSwapRequest; settled: boolean }> } {
  const { swapRequest, completedByUserId, nowIso = new Date().toISOString() } = params;

  if (completedByUserId !== swapRequest.requesterId && completedByUserId !== swapRequest.recipientId) {
    return {
      state,
      result: {
        success: false,
        code: "UNAUTHORIZED",
        message: "Only exchange participants can confirm completion",
      },
    };
  }

  if (swapRequest.status === "completed") {
    return {
      state,
      result: {
        success: true,
        code: "ALREADY_COMPLETED",
        message: "Swap is already completed",
        data: { swapRequest, settled: true },
      },
    };
  }

  const isRequester = completedByUserId === swapRequest.requesterId;
  const updatedReq: SkillSwapRequest = {
    ...swapRequest,
    requesterConfirmedAt: isRequester ? (swapRequest.requesterConfirmedAt || nowIso) : swapRequest.requesterConfirmedAt,
    recipientConfirmedAt: !isRequester ? (swapRequest.recipientConfirmedAt || nowIso) : swapRequest.recipientConfirmedAt,
    updatedAt: nowIso,
  };

  const isBothConfirmed = Boolean(updatedReq.requesterConfirmedAt && updatedReq.recipientConfirmedAt);

  if (!isBothConfirmed) {
    const nextSwapState: SkillSwapRequest = {
      ...updatedReq,
      status: "waiting_for_completion",
    };

    return {
      state,
      result: {
        success: true,
        code: "SUCCESS",
        message: "Completion confirmed. Waiting for recipient/other party confirmation.",
        data: { swapRequest: nextSwapState, settled: false },
      },
    };
  }

  // Both confirmed -> Atomic Settlement
  const settleRes = settleExchange(state, { swapRequest: updatedReq, nowIso });
  if (!settleRes.result.success && settleRes.result.code !== "IDEMPOTENT_REPLAY") {
    return {
      state,
      result: {
        success: false,
        code: settleRes.result.code,
        message: settleRes.result.message,
      },
    };
  }

  const finalCompletedSwap: SkillSwapRequest = {
    ...updatedReq,
    status: "completed",
    settlementId: settleRes.result.data?.settlementId || `settlement:${swapRequest.id}`,
  };

  return {
    state: settleRes.state,
    result: {
      success: true,
      code: "SUCCESS",
      message: "Both parties confirmed completion. Exchange settled successfully.",
      data: { swapRequest: finalCompletedSwap, settled: true },
    },
  };
}

export function refundExchange(
  state: CreditEngineState,
  params: {
    swapId: ID;
    requestedByUserId: ID;
    description?: string;
    nowIso?: string;
  }
): { state: CreditEngineState; result: CreditOperationResult<CreditTransaction> } {
  const { swapId, requestedByUserId, description, nowIso = new Date().toISOString() } = params;

  const refundKey = `refund:${swapId}`;

  // Idempotency check
  const existingRefund = state.transactions.find((t) => t.idempotencyKey === refundKey);
  if (existingRefund) {
    return {
      state,
      result: {
        success: true,
        code: "IDEMPOTENT_REPLAY",
        message: "Refund already processed for this exchange",
        data: existingRefund,
      },
    };
  }

  // Find original settlement capture transaction for learner
  const settlementKey = `settlement:${swapId}`;
  const originalCaptureTx = state.transactions.find(
    (t) => t.referenceId === swapId && t.type === "hold_capture"
  );

  if (!originalCaptureTx) {
    return {
      state,
      result: {
        success: false,
        code: "INVALID_STATE",
        message: "Original settlement capture transaction not found for refund",
      },
    };
  }

  const learnerId = originalCaptureTx.userId;
  const amount = originalCaptureTx.amount;

  const learnerAccount = state.accounts[learnerId];
  if (!learnerAccount) {
    return {
      state,
      result: {
        success: false,
        code: "USER_NOT_FOUND",
        message: "Learner account not found",
      },
    };
  }

  const refundTx: CreditTransaction = {
    id: generateId("tx"),
    userId: learnerId,
    amount,
    type: "cancellation_refund",
    direction: "credit",
    status: "completed",
    referenceType: "swap",
    referenceId: swapId,
    description: description || `Refund for exchange #${swapId} (ref: ${settlementKey})`,
    createdAt: nowIso,
    idempotencyKey: refundKey,
    reversesTransactionId: originalCaptureTx.id,
  };

  const updatedAccount: CreditAccount = {
    ...learnerAccount,
    available: learnerAccount.available + amount,
    lifetimeRefunded: learnerAccount.lifetimeRefunded + amount,
    version: learnerAccount.version + 1,
    updatedAt: nowIso,
  };

  return {
    state: {
      accounts: { ...state.accounts, [learnerId]: updatedAccount },
      transactions: [refundTx, ...state.transactions],
      holds: state.holds,
    },
    result: {
      success: true,
      code: "SUCCESS",
      message: "Exchange refund processed successfully",
      data: refundTx,
    },
  };
}

export function getCreditAudit(state: CreditEngineState, userId: ID): CreditAuditLog {
  const account = state.accounts[userId] || {
    userId,
    available: 0,
    held: 0,
    lifetimeEarned: 0,
    lifetimeSpent: 0,
    lifetimeRefunded: 0,
    version: 0,
    updatedAt: new Date().toISOString(),
  };

  const userTxs = state.transactions
    .filter((t) => t.userId === userId && t.status === "completed")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  let computedAvailable = 0;
  let computedHeld = 0;
  let initialGrant = 0;
  let totalEarned = 0;
  let totalSpent = 0;
  let totalRefunded = 0;

  const entries = userTxs.map((t) => {
    let change = 0;
    if (t.type === "initial_grant") {
      initialGrant += t.amount;
      computedAvailable += t.amount;
      change = t.amount;
    } else if (t.type === "teaching_reward" || t.type === "bonus" || t.type === "adjustment") {
      totalEarned += t.amount;
      computedAvailable += t.amount;
      change = t.amount;
    } else if (t.type === "refund" || t.type === "cancellation_refund") {
      totalRefunded += t.amount;
      computedAvailable += t.amount;
      change = t.amount;
    } else if (t.type === "hold") {
      computedAvailable -= t.amount;
      computedHeld += t.amount;
      change = -t.amount;
    } else if (t.type === "hold_release" || t.type === "expired_release") {
      computedAvailable += t.amount;
      computedHeld -= t.amount;
      change = t.amount;
    } else if (t.type === "learning_payment" || t.type === "penalty") {
      totalSpent += t.amount;
      computedAvailable -= t.amount;
      change = -t.amount;
    } else if (t.type === "hold_capture") {
      totalSpent += t.amount;
      computedHeld -= t.amount;
      change = 0; // Held was already subtracted from available during hold creation
    }

    return {
      date: t.createdAt,
      description: t.description,
      change,
      type: t.type,
      referenceId: t.referenceId,
    };
  });

  const reconciled = account.available === computedAvailable && account.held === computedHeld;

  return {
    userId,
    initialGrant,
    totalEarned,
    totalSpent,
    totalRefunded,
    totalHeld: account.held,
    computedAvailable,
    computedHeld,
    accountAvailable: account.available,
    accountHeld: account.held,
    reconciled,
    entries: entries.reverse(),
  };
}
