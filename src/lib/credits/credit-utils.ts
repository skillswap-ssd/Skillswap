import type { ID } from "@/data/models";

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export function buildIdempotencyKey(...parts: (string | ID | undefined)[]): string {
  return parts.filter(Boolean).join(":");
}

export function formatCreditAmount(amount: number): string {
  if (amount > 0) return `+${amount}`;
  return `${amount}`;
}
