import type { ID } from "@/data/models";

export type CreditTransactionType =
  | "initial_grant"
  | "teaching_reward"
  | "learning_payment"
  | "hold"
  | "hold_release"
  | "hold_capture"
  | "refund"
  | "expired_release"
  | "cancellation_refund"
  | "penalty"
  | "bonus"
  | "adjustment";

export type CreditTransactionDirection = "credit" | "debit";

export type CreditTransactionStatus = "pending" | "completed" | "reversed";

export type CreditReferenceType = "swap" | "session" | "practice" | "system" | "admin";

export type CreditHoldStatus = "active" | "captured" | "released" | "expired";

export type SwapStateMachineStatus =
  | "pending"
  | "accepted"
  | "active"
  | "waiting_for_completion"
  | "completed"
  | "declined"
  | "cancelled";

export type CreditErrorCode =
  | "SUCCESS"
  | "INSUFFICIENT_CREDITS"
  | "HOLD_NOT_FOUND"
  | "INVALID_AMOUNT"
  | "ALREADY_COMPLETED"
  | "ALREADY_SETTLED"
  | "MISSING_CREDIT_HOLD"
  | "SETTLEMENT_AMOUNT_MISMATCH"
  | "UNAUTHORIZED"
  | "SELF_SWAP_NOT_ALLOWED"
  | "INVALID_STATUS_TRANSITION"
  | "STALE_ACCOUNT_VERSION"
  | "SWAP_NOT_FOUND"
  | "USER_NOT_FOUND"
  | "INVALID_STATE"
  | "IDEMPOTENT_REPLAY"
  | "REFUND_EXCEEDS_ORIGINAL"
  | "ALREADY_REFUNDED"
  | "INTERNAL_ERROR";

export interface CreditAccount {
  userId: ID;
  available: number;
  held: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  lifetimeRefunded: number;
  version: number;
  updatedAt: string;
}

export interface CreditTransaction {
  id: ID;
  userId: ID;
  amount: number;
  type: CreditTransactionType;
  direction: CreditTransactionDirection;
  status: CreditTransactionStatus;
  referenceType: CreditReferenceType;
  referenceId?: ID;
  description: string;
  createdAt: string;
  idempotencyKey: string;
  reversesTransactionId?: ID;
}

export interface CreditHold {
  id: ID;
  userId: ID;
  amount: number;
  referenceType: CreditReferenceType;
  referenceId?: ID;
  status: CreditHoldStatus;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string;
  idempotencyKey: string;
}

export interface CreditOperationResult<T = unknown> {
  success: boolean;
  code?: CreditErrorCode;
  message?: string;
  required?: number;
  available?: number;
  data?: T;
}

export interface CreditAuditLog {
  userId: ID;
  initialGrant: number;
  totalEarned: number;
  totalSpent: number;
  totalRefunded: number;
  totalHeld: number;
  computedAvailable: number;
  computedHeld: number;
  accountAvailable: number;
  accountHeld: number;
  reconciled: boolean;
  entries: Array<{
    date: string;
    description: string;
    change: number;
    type: CreditTransactionType;
    referenceId?: ID;
  }>;
}
