export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAccounts } from "@/actions/accounts";
import { getDaysUntilDue, getCurrentCycle } from "@/lib/utils";
import { createDb } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { DashboardStats } from "@/components/dashboard-stats";
import { PushSubscribe } from "@/components/push-subscribe";

export default async function Home() {
  const db = createDb();
  const allAccounts = await getAccounts();

  // Sort accounts: overdue first, then by days until due
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
        };
      })
  );

  // Sort: overdue (unpaid) first, then due soon, then by days
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
          <div className="alert alert-info">
            <span>No accounts yet. Click &quot;+ Add&quot; to create one.</span>
          </div>
        ) : (
          accountsWithStatus.map((account) => {
            let alertClass = "alert-info";
            let statusText = "";

            if (account.isPaid) {
              alertClass = "alert-success";
              statusText = "Paid";
            } else if (account.daysUntilDue === null) {
              alertClass = "alert-neutral";
              statusText = "Past due";
            } else if (account.daysUntilDue < 0) {
              alertClass = "alert-error";
              statusText = `Overdue by ${Math.abs(account.daysUntilDue)} day${Math.abs(account.daysUntilDue) === 1 ? "" : "s"}`;
            } else if (account.daysUntilDue <= account.reminderDays) {
              alertClass = "alert-warning";
              statusText =
                account.daysUntilDue === 0
                  ? "Due today"
                  : `${account.daysUntilDue} day${account.daysUntilDue === 1 ? "" : "s"} left`;
            } else {
              statusText = `${account.daysUntilDue} day${account.daysUntilDue === 1 ? "" : "s"} left`;
            }

            return (
              <div key={account.id} className={`alert ${alertClass} flex-col items-start gap-2`}>
                <div className="flex w-full items-center justify-between">
                  <div>
                    <h3 className="font-bold">{account.name}</h3>
                    <p className="text-sm opacity-70">
                      Due: Day {account.dueDay} •{" "}
                      {account.type === "recurring" ? "Recurring" : "One-time"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{statusText}</span>
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

      <div className="mt-8">
        <PushSubscribe />
      </div>
    </div>
  );
}
