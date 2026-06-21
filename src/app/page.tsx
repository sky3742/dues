export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAccounts } from "@/actions/accounts";
import { getDaysUntilDue, getCurrentCycle, formatDueDate } from "@/lib/utils";
import { createDb } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { DashboardStats } from "@/components/dashboard-stats";
import { PushSubscribe } from "@/components/push-subscribe";
import { PaymentToggle } from "@/components/payment-toggle";

function getUrgencyClass(
  isPaid: boolean,
  daysUntilDue: number | null,
  reminderDays: number
): string {
  if (isPaid) return "alert-success";
  if (daysUntilDue === null) return "alert-neutral";
  if (daysUntilDue < 0) return "alert-error";
  if (daysUntilDue === 0) return "alert-error";
  if (daysUntilDue <= 3) return "alert-warning";
  if (daysUntilDue <= 7) return "bg-amber-100 border-amber-300 text-amber-800";
  return "alert-info";
}

export default async function Home() {
  const db = createDb();
  const allAccounts = await getAccounts();

  const accountsWithStatus = await Promise.all(
    allAccounts
      .filter((a) => a.isActive)
      .map(async (account) => {
        const daysUntilDue = getDaysUntilDue(account.dueDay, account.type, account.createdAt);
        const cycle = getCurrentCycle(account.type, account.createdAt);

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

        return {
          ...account,
          daysUntilDue,
          isPaid: payment?.paid ?? false,
          cycle,
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
    <div className="container mx-auto max-w-2xl p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dues Reminder</h1>
        <Link href="/accounts/new" className="btn btn-primary btn-sm">
          + Add
        </Link>
      </div>

      <div className="mb-6">
        <DashboardStats />
      </div>

      <div className="flex flex-col gap-3">
        {accountsWithStatus.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-lg font-medium mb-1">No accounts yet</p>
            <p className="text-sm opacity-60 mb-4">
              Create your first account to start tracking payments.
            </p>
            <Link href="/accounts/new" className="btn btn-primary btn-sm">
              + Add Account
            </Link>
          </div>
        ) : (
          accountsWithStatus.map((account) => {
            const alertClass = getUrgencyClass(
              account.isPaid,
              account.daysUntilDue,
              account.reminderDays
            );

            let statusText = "";
            if (account.isPaid) {
              statusText = "Paid";
            } else if (account.daysUntilDue === null) {
              statusText = "Past due";
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
              <div key={account.id} className={`alert ${alertClass} flex-col items-start gap-2`}>
                <div className="flex w-full items-start justify-between">
                  <div>
                    <h3 className="font-bold">{account.name}</h3>
                    <p className="text-sm opacity-70">
                      Due: {dueDateStr} • {account.type === "recurring" ? "Recurring" : "One-time"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{statusText}</span>
                    <PaymentToggle
                      account={account}
                      payment={account.isPaid ? { paid: true } : null}
                    />
                    <Link href={`/accounts/${account.id}/edit`} className="btn btn-ghost btn-xs">
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {accountsWithStatus.length > 0 && (
        <div className="mt-8 pt-6 border-t border-base-300">
          <PushSubscribe />
        </div>
      )}
    </div>
  );
}
