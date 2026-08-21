import type { ID } from "@/data/models";
import type { CreditEngineState } from "./credit-engine";
import { getCreditAudit } from "./credit-engine";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateCreditAccount(state: CreditEngineState, userId: ID): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const account = state.accounts[userId];
  if (!account) {
    return {
      valid: false,
      errors: [`No credit account found for user ID: ${userId}`],
      warnings: [],
    };
  }

  // Enforce invariants: available >= 0, held >= 0
  if (account.available < 0) {
    errors.push(`Negative available balance for user ${userId}: ${account.available}`);
  }

  if (account.held < 0) {
    errors.push(`Negative held balance for user ${userId}: ${account.held}`);
  }

  // Audit and reconciliation check
  const audit = getCreditAudit(state, userId);
  if (!audit.reconciled) {
    errors.push(
      `Reconciliation mismatch for user ${userId}: account.available (${account.available}) !== ledger computed (${audit.computedAvailable})`
    );
  }

  // Check duplicate transaction IDs or idempotency keys
  const userTxs = state.transactions.filter((t) => t.userId === userId);
  const txIds = new Set<string>();
  const txKeys = new Set<string>();

  for (const tx of userTxs) {
    if (txIds.has(tx.id)) {
      errors.push(`Duplicate transaction ID detected: ${tx.id}`);
    }
    txIds.add(tx.id);

    if (tx.idempotencyKey) {
      if (txKeys.has(tx.idempotencyKey)) {
        warnings.push(`Multiple transactions sharing idempotency key: ${tx.idempotencyKey}`);
      }
      txKeys.add(tx.idempotencyKey);
    }

    if (tx.amount <= 0) {
      errors.push(`Invalid non-positive transaction amount (${tx.amount}) in transaction ${tx.id}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateEntireCreditSystem(state: CreditEngineState): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  for (const userId of Object.keys(state.accounts)) {
    const res = validateCreditAccount(state, userId);
    allErrors.push(...res.errors);
    allWarnings.push(...res.warnings);
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}
