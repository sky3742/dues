import { createDb } from "@/lib/db";
import { accounts, payments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getDaysUntilDue, getCurrentCycle } from "@/lib/utils";

export async function DashboardStats() {
  const db = createDb();
  const allAccounts = await db.select().from(accounts);

  let overdueCount = 0;
  let dueSoonCount = 0;

  for (const account of allAccounts) {
    if (!account.isActive) continue;

    const daysUntilDue = getDaysUntilDue(account.dueDay, account.type, account.createdAt);
    const cycle = getCurrentCycle(account.type, account.createdAt);

    // Check if paid
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

    if (payment?.paid) continue;

    if (daysUntilDue !== null) {
      if (daysUntilDue < 0) {
        overdueCount++;
      } else if (daysUntilDue <= account.reminderDays) {
        dueSoonCount++;
      }
    }
  }

  return (
    <div className="stats shadow">
      <div className="stat">
        <div className="stat-title">Overdue</div>
        <div className={`stat-value ${overdueCount > 0 ? "text-error" : ""}`}>{overdueCount}</div>
      </div>
      <div className="stat">
        <div className="stat-title">Due Soon</div>
        <div className={`stat-value ${dueSoonCount > 0 ? "text-warning" : ""}`}>{dueSoonCount}</div>
      </div>
      <div className="stat">
        <div className="stat-title">Total Accounts</div>
        <div className="stat-value">{allAccounts.filter((a) => a.isActive).length}</div>
      </div>
    </div>
  );
}
