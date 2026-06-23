export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAccounts } from "@/actions/accounts";
import { getDaysUntilDue, formatDueDate, getNextDueDate } from "@/lib/utils";
import { createDb } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { DashboardStats } from "@/components/dashboard-stats";
import { PushSubscribe } from "@/components/push-subscribe";
import { PaymentToggle } from "@/components/payment-toggle";
import { PageTransition } from "@/components/page-transition";

function getUrgencyConfig(
  isPaid: boolean,
  daysUntilDue: number | null
): { color: string; border: string } {
  if (isPaid) return { color: "text-success", border: "border-success" };
  if (daysUntilDue === null) return { color: "text-base-content/50", border: "border-base-300" };
  if (daysUntilDue < 0) return { color: "text-error", border: "border-error" };
  if (daysUntilDue === 0) return { color: "text-error", border: "border-error" };
  if (daysUntilDue <= 3) return { color: "text-warning", border: "border-warning" };
  if (daysUntilDue <= 7) return { color: "text-orange-500", border: "border-orange-500" };
  return { color: "text-info", border: "border-info" };
}

export default async function Home() {
  const db = createDb();
  const allAccounts = await getAccounts();

  const accountsWithStatus = await Promise.all(
    allAccounts
      .filter((a) => a.isActive)
      .map(async (account) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const nextDue = getNextDueDate(account.dueDay, account.type, account.createdAt);

        const daysUntilNextDue = nextDue
          ? Math.round((nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          : null;
        const inStatementWindow = daysUntilNextDue !== null && daysUntilNextDue <= 20;

        let cycle: { year: number; month: number };
        let daysUntilDue: number | null;

        if (inStatementWindow && nextDue) {
          cycle = { year: nextDue.getFullYear(), month: nextDue.getMonth() + 1 };
          daysUntilDue = daysUntilNextDue;
        } else {
          cycle = { year: now.getFullYear(), month: now.getMonth() + 1 };
          daysUntilDue = getDaysUntilDue(account.dueDay, account.type, account.createdAt);
        }

        const [payment] = await db
          .select()
          .from(payments)
          .where(
            and(
              eq(payments.accountId, account.id),
              eq(payments.year, cycle.year),
              eq(payments.month, cycle.month)
            )
          )
          .limit(1);

        const isPaid = payment?.paid ?? false;

        let nextDueDateStr: string | null = null;
        if (isPaid) {
          let nextMonth = cycle.month + 1;
          let nextYear = cycle.year;
          if (nextMonth > 12) {
            nextMonth = 1;
            nextYear++;
          }
          nextDueDateStr = formatDueDate(account.dueDay, nextYear, nextMonth);
        }

        return {
          ...account,
          daysUntilDue,
          isPaid,
          cycle,
          nextDueDateStr,
        };
      })
  );

  accountsWithStatus.sort((a, b) => {
    if (a.isPaid && !b.isPaid) return 1;
    if (!a.isPaid && b.isPaid) return -1;
    if (a.daysUntilDue === null) return 1;
    if (b.daysUntilDue === null) return -1;
    return a.daysUntilDue - b.daysUntilDue;
  });

  return (
    <PageTransition>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-base-content/60">Track your upcoming payments and dues</p>
        </div>

        <div className="mb-8">
          <DashboardStats />
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upcoming Dues</h2>
            <Link href="/accounts/new" className="btn btn-primary btn-sm gap-1">
              <span className="text-lg leading-none">+</span>
              <span>Add Account</span>
            </Link>
          </div>

          {accountsWithStatus.length === 0 ? (
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body items-center text-center py-16">
                <div className="text-6xl mb-4 animate-pulse-soft">📋</div>
                <h3 className="text-xl font-semibold mb-2">No accounts yet</h3>
                <p className="text-base-content/60 mb-6 max-w-sm">
                  Create your first account to start tracking payments and receive timely reminders.
                </p>
                <Link href="/accounts/new" className="btn btn-primary gap-2">
                  <span className="text-lg">+</span>
                  Create Your First Account
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {accountsWithStatus.map((account, index) => {
                const urgency = getUrgencyConfig(account.isPaid, account.daysUntilDue);

                let statusText = "";
                if (account.isPaid) {
                  statusText = account.nextDueDateStr
                    ? `Paid — next due ${account.nextDueDateStr}`
                    : "Paid";
                } else if (account.daysUntilDue === null) {
                  statusText = "Past due";
                } else if (account.daysUntilDue < 0) {
                  const overdueDays = Math.abs(account.daysUntilDue);
                  statusText = `Overdue by ${overdueDays} day${overdueDays === 1 ? "" : "s"}`;
                } else if (account.daysUntilDue === 0) {
                  statusText = "Due today";
                } else {
                  statusText = `${account.daysUntilDue} day${account.daysUntilDue === 1 ? "" : "s"} left`;
                }

                const dueDateStr = formatDueDate(
                  account.dueDay,
                  account.cycle.year,
                  account.cycle.month
                );

                return (
                  <div
                    key={account.id}
                    className={`stagger-item card bg-base-100 shadow-sm card-hover border border-base-300/50 border-l-4 ${urgency.border}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="card-body p-3 sm:p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold truncate">{account.name}</h3>
                        <span className={`text-sm font-medium ${urgency.color} shrink-0`}>
                          {statusText}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-sm text-base-content/60">
                        <span className="truncate">
                          Due: {dueDateStr} •{" "}
                          {account.type === "recurring" ? "Monthly" : "One-time"}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <PaymentToggle
                            account={account}
                            payment={account.isPaid ? { paid: true } : null}
                          />
                          <Link
                            href={`/accounts/${account.id}/edit`}
                            className="btn btn-ghost btn-xs"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {accountsWithStatus.length > 0 && (
          <div className="card bg-base-100 shadow-sm mt-8">
            <div className="card-body">
              <PushSubscribe />
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
