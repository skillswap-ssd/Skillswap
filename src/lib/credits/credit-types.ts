import type { ID } from "@/data/models";

export type CreditTransactionType =
  | "initial_grant"
  | "teaching_reward"
  | "learning_payment"
  | "hold"
  | "hold_release"
  | "hold_capture"
  | "refund"
  | "bonus"
  | "adjustment"
  | "cancellation_refund"
  | "penalty";

export type CreditTransactionDirection = "credit" | "debit";

export type CreditTransactionStatus = "pending" | "completed" | "reversed";

export type CreditReferenceType = "swap" | "session" | "practice" | "system" | "admin";

export type CreditHoldStatus = "active" | "captured" | "released";

export interface CreditAccount {
  userId: ID;
  available: number;
  held: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
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
  idempotencyKey: string;
}

export interface CreditOperationResult<T = unknown> {
  success: boolean;
  code?:
    | "SUCCESS"
    | "INSUFFICIENT_CREDITS"
    | "HOLD_NOT_FOUND"
    | "INVALID_AMOUNT"
    | "ALREADY_COMPLETED"
    | "SWAP_NOT_FOUND"
    | "USER_NOT_FOUND"
    | "INVALID_STATE"
    | "IDEMPOTENT_REPLAY"
    | "INTERNAL_ERROR";
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
  totalHeld: number;
  computedAvailable: number;
  accountAvailable: number;
  reconciled: boolean;
  entries: Array<{
    date: string;
    description: string;
    change: number;
    type: CreditTransactionType;
    referenceId?: ID;
  }>;
}
