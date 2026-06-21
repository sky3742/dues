import { createDb } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getDaysUntilDue, getCurrentCycle, formatDueDate } from "@/lib/utils";
import { PaymentToggle } from "./payment-toggle";
import Link from "next/link";

type Account = {
  id: string;
  name: string;
  type: "recurring" | "one_time";
  dueDay: number;
  reminderDays: number;
  isActive: boolean;
  createdAt: string;
};

type AccountCardProps = {
  account: Account;
};

export async function AccountCard({ account }: AccountCardProps) {
  const db = createDb();
  const daysUntilDue = getDaysUntilDue(account.dueDay, account.type, account.createdAt);
  const cycle = getCurrentCycle(account.type, account.createdAt);

  // Fetch payment status for current cycle
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

  // Determine card style based on status
  let alertClass = "alert-info"; // Default: not due yet
  let statusText = "";

  if (isPaid) {
    alertClass = "alert-success";
    statusText = "Paid";
  } else if (daysUntilDue === null) {
    alertClass = "alert-neutral";
    statusText = "Past due";
  } else if (daysUntilDue < 0) {
    alertClass = "alert-error";
    statusText = `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) === 1 ? "" : "s"}`;
  } else if (daysUntilDue <= account.reminderDays) {
    alertClass = "alert-warning";
    statusText =
      daysUntilDue === 0 ? "Due today" : `${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"} left`;
  } else {
    statusText = `${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"} left`;
  }

  const dueDateStr = formatDueDate(account.dueDay, cycle.year, cycle.month);

  return (
    <div className={`alert ${alertClass} flex-col items-start gap-2`}>
      <div className="flex w-full items-start justify-between">
        <div>
          <h3 className="font-bold">{account.name}</h3>
          <p className="text-sm opacity-70">
            Due: {dueDateStr} • {account.type === "recurring" ? "Recurring" : "One-time"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">{statusText}</span>
          <PaymentToggle account={account} payment={payment} />
        </div>
      </div>
      <div className="flex gap-2">
        <Link href={`/accounts/${account.id}/edit`} className="btn btn-ghost btn-xs">
          Edit
        </Link>
      </div>
    </div>
  );
}
