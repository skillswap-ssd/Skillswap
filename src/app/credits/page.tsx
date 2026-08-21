"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSkillSwap } from "@/lib/context/skillswap-context";
import { CREDIT_RULES } from "@/lib/credits/credit-rules";
import { formatCreditAmount } from "@/lib/credits/credit-utils";
import { ArrowDownLeft, ArrowUpRight, Coins, HelpCircle, ShieldCheck, History, Terminal } from "lucide-react";
import { useState } from "react";

export default function CreditsDashboardPage() {
  const { currentUserId, getCreditAccount, getCreditTransactions, getCreditAudit, adminAdjustCredits } =
    useSkillSwap();

  const account = getCreditAccount(currentUserId);
  const transactions = getCreditTransactions(currentUserId);
  const audit = getCreditAudit(currentUserId);

  const [showAudit, setShowAudit] = useState(false);
  const [adminAmount, setAdminAmount] = useState<number>(5);
  const [adminReason, setAdminReason] = useState<string>("Community contribution bonus");
  const [adminFeedback, setAdminFeedback] = useState<string | null>(null);

  const handleAdminAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminAmount || !adminReason.trim()) return;
    const res = adminAdjustCredits(currentUserId, adminAmount, adminReason);
    if (res.success) {
      setAdminFeedback(`Successfully adjusted ${adminAmount > 0 ? "+" : ""}${adminAmount} credits.`);
      setTimeout(() => setAdminFeedback(null), 3000);
    } else {
      setAdminFeedback(`Error: ${res.message}`);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Credit Subsystem & Ledger"
        title="SkillSwap Credit Economy"
        body="SkillSwap uses a double-sided credit ledger. You earn credits by teaching and spend credits when learning. Credits represent value exchanged inside SkillSwap."
      />

      {/* Economical Overview Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
        <Card className="p-4 border-2 border-[var(--primary)] bg-[var(--surface)]">
          <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider block">
            Available Balance
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-3xl font-display font-bold text-[var(--primary)]">🪙 {account.available}</span>
          </div>
          <span className="text-[11px] text-[var(--muted)] mt-1 block">Ready to spend on learning</span>
        </Card>

        <Card className="p-4 border border-[var(--border)] bg-[var(--surface-muted)]">
          <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider block">
            Held in Escrow
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-display font-bold text-[var(--foreground)]">🪙 {account.held}</span>
          </div>
          <span className="text-[11px] text-[var(--muted)] mt-1 block">Reserved for active/pending swaps</span>
        </Card>

        <Card className="p-4 border border-[var(--border)] bg-[var(--surface)]">
          <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider block">
            Lifetime Earned
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-display font-bold text-emerald-600 dark:text-emerald-400">
              +{account.lifetimeEarned}
            </span>
          </div>
          <span className="text-[11px] text-[var(--muted)] mt-1 block">Earned from teaching & bonuses</span>
        </Card>

        <Card className="p-4 border border-[var(--border)] bg-[var(--surface)]">
          <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider block">
            Lifetime Spent
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-display font-bold text-amber-600 dark:text-amber-400">
              -{account.lifetimeSpent}
            </span>
          </div>
          <span className="text-[11px] text-[var(--muted)] mt-1 block">Spent on learning sessions</span>
        </Card>
      </div>

      {/* Explanation Banner */}
      <Card className="p-5 my-6 border-l-4 border-[var(--primary)] bg-[var(--surface-muted)]">
        <div className="flex items-center gap-2 font-display text-lg font-bold">
          <Coins className="text-[var(--primary)]" size={20} /> How SkillSwap Credit Economy Works
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-3 text-xs leading-relaxed">
          <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-sm">
            <b className="block text-sm mb-1 text-[var(--foreground)]">1. Teach to Earn</b>
            <p className="text-[var(--muted)]">
              When you host a session and teach a skill, you earn 🪙 {CREDIT_RULES.TEACHING_REWARD} credits upon atomic session completion.
            </p>
          </div>
          <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-sm">
            <b className="block text-sm mb-1 text-[var(--foreground)]">2. Learn with Escrow Holds</b>
            <p className="text-[var(--muted)]">
              When requesting a session, 🪙 {CREDIT_RULES.CREDITS_PER_SWAP} credits are temporarily held in escrow. They are only captured when both parties confirm completion.
            </p>
          </div>
          <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-sm">
            <b className="block text-sm mb-1 text-[var(--foreground)]">3. Guaranteed Refunds</b>
            <p className="text-[var(--muted)]">
              If a session is declined or cancelled before completion, your held credits are automatically released back to your available balance.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8 my-8">
        {/* Ledger Transaction History */}
        <div>
          <div className="flex justify-between items-center mb-4 border-b border-[var(--border)] pb-2">
            <h2 className="font-display text-2xl flex items-center gap-2">
              <History size={20} /> Transaction Ledger History
            </h2>
            <span className="text-xs text-[var(--muted)] font-mono">{transactions.length} immutable entries</span>
          </div>

          {transactions.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[var(--border)] text-sm text-[var(--muted)]">
              No financial transactions recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => {
                const isCredit = tx.direction === "credit";
                return (
                  <Card key={tx.id} className="p-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          isCredit
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {isCredit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                      </div>

                      <div>
                        <div className="font-bold flex items-center gap-2">
                          <span>{tx.description}</span>
                          <span className="text-[10px] font-mono uppercase bg-[var(--surface-muted)] px-1.5 py-0.5 border border-[var(--border)] rounded-xs">{tx.type}</span>
                        </div>
                        <div className="text-xs text-[var(--muted)] mt-0.5">
                          {new Date(tx.createdAt).toLocaleString()} · Idempotency:{" "}
                          <code className="text-[10px] bg-[var(--surface-muted)] px-1 rounded">{tx.idempotencyKey}</code>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-display text-lg font-bold ${
                          isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {isCredit ? "+" : "-"}{tx.amount}
                      </span>
                      <span className="block text-[10px] text-[var(--muted)] capitalize">{tx.status}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar: System Audit & Admin Sandbox */}
        <aside className="space-y-6">
          <Card className="p-5 border border-[var(--border)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg font-bold flex items-center gap-1.5">
                <ShieldCheck size={18} className="text-emerald-600" /> Accounting Audit
              </h3>
              <Button variant="ghost" className="text-xs h-7 px-2" onClick={() => setShowAudit(!showAudit)}>
                {showAudit ? "Hide Details" : "Inspect Audit"}
              </Button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[var(--border)]">
                <span className="text-[var(--muted)]">Initial Grant</span>
                <span className="font-bold">+{audit.initialGrant}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border)]">
                <span className="text-[var(--muted)]">Total Earned</span>
                <span className="font-bold text-emerald-600">+{audit.totalEarned}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border)]">
                <span className="text-[var(--muted)]">Total Spent</span>
                <span className="font-bold text-amber-600">-{audit.totalSpent}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border)]">
                <span className="text-[var(--muted)]">Computed Balance</span>
                <span className="font-bold">{audit.computedAvailable}</span>
              </div>
              <div className="flex justify-between py-1 pt-2 font-bold text-sm">
                <span>Account Status</span>
                <span className={audit.reconciled ? "text-emerald-600" : "text-red-600"}>
                  {audit.reconciled ? "Reconciled ✓" : "Mismatch Warning ⚠"}
                </span>
              </div>
            </div>

            {showAudit && (
              <div className="mt-4 pt-3 border-t border-[var(--border)] font-mono text-[11px] bg-[var(--surface-muted)] p-3 space-y-1">
                <div className="font-bold text-[var(--foreground)] mb-1">Ledger Entry Trace ({audit.entries.length}):</div>
                {audit.entries.map((entry, idx) => (
                  <div key={idx} className="flex justify-between text-[10px]">
                    <span className="truncate max-w-[180px]">{entry.description}</span>
                    <span className="font-bold">{formatCreditAmount(entry.change)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Development / Admin Adjustments */}
          <Card className="p-5 border border-[var(--border)] bg-[var(--surface-muted)]">
            <h3 className="font-display text-lg font-bold flex items-center gap-1.5 mb-2">
              <Terminal size={18} /> Admin Adjustment
            </h3>
            <p className="text-xs text-[var(--muted)] mb-3">
              Explicit administrative adjustment operation for development testing. All adjustments generate ledger entries.
            </p>

            <form onSubmit={handleAdminAdjust} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Adjustment Amount (+ or -)</label>
                <input
                  type="number"
                  value={adminAmount}
                  onChange={(e) => setAdminAmount(Number(e.target.value))}
                  className="w-full p-2 border border-[var(--border)] bg-[var(--background)] font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Reason / Description</label>
                <input
                  type="text"
                  value={adminReason}
                  onChange={(e) => setAdminReason(e.target.value)}
                  className="w-full p-2 border border-[var(--border)] bg-[var(--background)]"
                  required
                />
              </div>

              {adminFeedback && (
                <div className="p-2 border bg-[var(--surface)] text-xs font-bold text-center">
                  {adminFeedback}
                </div>
              )}

              <Button type="submit" className="w-full text-xs py-2">
                Apply Ledger Adjustment
              </Button>
            </form>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}
