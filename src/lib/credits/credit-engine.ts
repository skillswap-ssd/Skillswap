import type { ID, SkillSwapRequest } from "@/data/models";
import { CREDIT_RULES } from "./credit-rules";
import type {
  CreditAccount,
  CreditAuditLog,
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
  // Check idempotency
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

  const hold: CreditHold = {
    id: generateId("hold"),
    userId,
    amount,
    referenceType,
    referenceId,
    status: "active",
    createdAt: nowIso,
    updatedAt: nowIso,
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

  const hold = state.holds.find((h) => h.id === holdId || h.idempotencyKey === params.idempotencyKey || (holdId && h.referenceId === holdId));
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

export function refundCredits(
  state: CreditEngineState,
  params: {
    userId: ID;
    amount: number;
    referenceType: "swap" | "session" | "system" | "admin";
    referenceId?: ID;
    description: string;
    idempotencyKey: string;
  },
  nowIso = new Date().toISOString()
): { state: CreditEngineState; result: CreditOperationResult<CreditTransaction> } {
  const { userId, amount, referenceType, referenceId, description, idempotencyKey } = params;

  // Idempotency check
  const existingTx = state.transactions.find((t) => t.idempotencyKey === idempotencyKey);
  if (existingTx) {
    return {
      state,
      result: {
        success: true,
        code: "IDEMPOTENT_REPLAY",
        message: "Refund already processed",
        data: existingTx,
      },
    };
  }

  const account = state.accounts[userId];
  if (!account) {
    return {
      state,
      result: {
        success: false,
        code: "USER_NOT_FOUND",
        message: "User account not found for refund",
      },
    };
  }

  const refundTx: CreditTransaction = {
    id: generateId("tx"),
    userId,
    amount,
    type: "cancellation_refund",
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
    version: account.version + 1,
    updatedAt: nowIso,
  };

  return {
    state: {
      accounts: { ...state.accounts, [userId]: updatedAccount },
      transactions: [refundTx, ...state.transactions],
      holds: state.holds,
    },
    result: {
      success: true,
      code: "SUCCESS",
      message: "Refund processed successfully",
      data: refundTx,
    },
  };
}

export function completeSkillSwapAtomic(
  state: CreditEngineState,
  params: {
    swapRequest: SkillSwapRequest;
    completedByUserId: ID;
    amount?: number;
    nowIso?: string;
  }
): { state: CreditEngineState; result: CreditOperationResult } {
  const { swapRequest, amount = CREDIT_RULES.CREDITS_PER_SWAP, nowIso = new Date().toISOString() } = params;

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

  if (swapRequest.status === "completed") {
    return {
      state,
      result: {
        success: false,
        code: "ALREADY_COMPLETED",
        message: "Swap is already marked as completed",
      },
    };
  }

  const learnerId = swapRequest.requesterId;
  const teacherId = swapRequest.recipientId;

  const captureIdempotencyKey = buildIdempotencyKey("session", swapRequest.id, "learner_capture");
  const rewardIdempotencyKey = buildIdempotencyKey("session", swapRequest.id, "teacher_reward");

  // Replay check for atomic completion
  const existingCapture = state.transactions.find((t) => t.idempotencyKey === captureIdempotencyKey);
  const existingReward = state.transactions.find((t) => t.idempotencyKey === rewardIdempotencyKey);
  if (existingCapture && existingReward) {
    return {
      state,
      result: {
        success: true,
        code: "IDEMPOTENT_REPLAY",
        message: "SkillSwap completion already processed",
      },
    };
  }

  // Locate active hold for learner
  const activeHold = state.holds.find(
    (h) => h.referenceId === swapRequest.id && h.userId === learnerId && h.status === "active"
  );

  let tempState = state;

  if (activeHold) {
    const captureRes = captureCreditHold(tempState, {
      holdId: activeHold.id,
      idempotencyKey: captureIdempotencyKey,
      description: `SkillSwap session completed (learned skill)`,
    }, nowIso);

    if (!captureRes.result.success && captureRes.result.code !== "IDEMPOTENT_REPLAY") {
      return { state, result: captureRes.result };
    }
    tempState = captureRes.state;
  } else {
    // If no active hold (e.g. legacy/direct completion), direct debit learner if available
    const learnerAcc = tempState.accounts[learnerId];
    if (learnerAcc && learnerAcc.available >= amount) {
      const debitTx: CreditTransaction = {
        id: generateId("tx"),
        userId: learnerId,
        amount,
        type: "learning_payment",
        direction: "debit",
        status: "completed",
        referenceType: "swap",
        referenceId: swapRequest.id,
        description: "SkillSwap session payment",
        createdAt: nowIso,
        idempotencyKey: captureIdempotencyKey,
      };

      const updatedLearnerAcc: CreditAccount = {
        ...learnerAcc,
        available: learnerAcc.available - amount,
        lifetimeSpent: learnerAcc.lifetimeSpent + amount,
        version: learnerAcc.version + 1,
        updatedAt: nowIso,
      };

      tempState = {
        ...tempState,
        accounts: { ...tempState.accounts, [learnerId]: updatedLearnerAcc },
        transactions: [debitTx, ...tempState.transactions],
      };
    }
  }

  // Reward Teacher
  const awardRes = awardCredits(
    tempState,
    {
      userId: teacherId,
      amount,
      referenceType: "swap",
      referenceId: swapRequest.id,
      description: "Teaching reward for completed SkillSwap",
      idempotencyKey: rewardIdempotencyKey,
      type: "teaching_reward",
    },
    nowIso
  );

  if (!awardRes.result.success && awardRes.result.code !== "IDEMPOTENT_REPLAY") {
    return { state, result: awardRes.result };
  }

  return {
    state: awardRes.state,
    result: {
      success: true,
      code: "SUCCESS",
      message: "SkillSwap completed atomically and credits updated",
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
    version: 0,
    updatedAt: new Date().toISOString(),
  };

  const userTxs = state.transactions
    .filter((t) => t.userId === userId && t.status === "completed")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  let computedAvailable = 0;
  let initialGrant = 0;
  let totalEarned = 0;
  let totalSpent = 0;

  const entries = userTxs.map((t) => {
    let change = 0;
    if (t.type === "initial_grant") {
      initialGrant += t.amount;
      computedAvailable += t.amount;
      change = t.amount;
    } else if (t.type === "teaching_reward" || t.type === "bonus" || t.type === "adjustment" || t.type === "refund" || t.type === "cancellation_refund") {
      totalEarned += t.amount;
      computedAvailable += t.amount;
      change = t.amount;
    } else if (t.type === "hold") {
      computedAvailable -= t.amount;
      change = -t.amount;
    } else if (t.type === "hold_release") {
      computedAvailable += t.amount;
      change = t.amount;
    } else if (t.type === "learning_payment" || t.type === "penalty") {
      totalSpent += t.amount;
      computedAvailable -= t.amount;
      change = -t.amount;
    } else if (t.type === "hold_capture") {
      totalSpent += t.amount;
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

  const reconciled = account.available === computedAvailable;

  return {
    userId,
    initialGrant,
    totalEarned,
    totalSpent,
    totalHeld: account.held,
    computedAvailable,
    accountAvailable: account.available,
    reconciled,
    entries: entries.reverse(),
  };
}
