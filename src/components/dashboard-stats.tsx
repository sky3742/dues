import { createDb } from "@/lib/db";
import { accounts, payments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getDaysUntilDue, getNextDueDate } from "@/lib/utils";

export async function DashboardStats() {
  const db = createDb();
  const allAccounts = await db.select().from(accounts);

  let overdueCount = 0;
  let dueSoonCount = 0;
  let paidCount = 0;

  for (const account of allAccounts) {
    if (!account.isActive) continue;

    const daysUntilDue = getDaysUntilDue(account.dueDay, account.type, account.createdAt);

    const nextDue = getNextDueDate(account.dueDay, account.type, account.createdAt);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let cycle: { year: number; month: number };
    if (nextDue) {
      const daysUntilNextDue = Math.round(
        (nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilNextDue <= 20) {
        cycle = { year: nextDue.getFullYear(), month: nextDue.getMonth() + 1 };
      } else {
        cycle = { year: now.getFullYear(), month: now.getMonth() + 1 };
      }
    } else {
      cycle = { year: now.getFullYear(), month: now.getMonth() + 1 };
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

    if (payment?.paid) {
      paidCount++;
      continue;
    }

    if (daysUntilDue !== null) {
      if (daysUntilDue < 0) {
        overdueCount++;
      } else if (daysUntilDue <= account.reminderDays) {
        dueSoonCount++;
      }
    }
  }

  const activeCount = allAccounts.filter((a) => a.isActive).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="stat bg-base-100 rounded-xl shadow-sm border border-base-300/50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-base-content/5 flex items-center justify-center">
            <span className="text-xl">📊</span>
          </div>
          <div>
            <div className="text-xs text-base-content/60 uppercase tracking-wide">Total</div>
            <div className="text-2xl font-bold">{activeCount}</div>
          </div>
        </div>
      </div>

      <div className="stat bg-base-100 rounded-xl shadow-sm border border-base-300/50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center">
            <span className="text-xl">🚨</span>
          </div>
          <div>
            <div className="text-xs text-base-content/60 uppercase tracking-wide">Overdue</div>
            <div className={`text-2xl font-bold ${overdueCount > 0 ? "text-error" : ""}`}>
              {overdueCount}
            </div>
          </div>
        </div>
      </div>

      <div className="stat bg-base-100 rounded-xl shadow-sm border border-base-300/50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <span className="text-xl">⏰</span>
          </div>
          <div>
            <div className="text-xs text-base-content/60 uppercase tracking-wide">Due Soon</div>
            <div className={`text-2xl font-bold ${dueSoonCount > 0 ? "text-warning" : ""}`}>
              {dueSoonCount}
            </div>
          </div>
        </div>
      </div>

      <div className="stat bg-base-100 rounded-xl shadow-sm border border-base-300/50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <span className="text-xl">✅</span>
          </div>
          <div>
            <div className="text-xs text-base-content/60 uppercase tracking-wide">Paid</div>
            <div className="text-2xl font-bold text-success">{paidCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
