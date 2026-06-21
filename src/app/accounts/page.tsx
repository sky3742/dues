export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAccounts } from "@/actions/accounts";
import { formatDueDate, getCurrentCycle } from "@/lib/utils";
import { DeleteAccountButton } from "@/components/delete-account-button";

export default async function AccountsPage() {
  const accounts = await getAccounts();

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Accounts</h1>
        <Link href="/accounts/new" className="btn btn-primary btn-sm">
          + Add
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {accounts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📂</div>
            <p className="text-lg font-medium mb-1">No accounts yet</p>
            <p className="text-sm opacity-60 mb-4">
              Create your first account to start tracking payments.
            </p>
            <Link href="/accounts/new" className="btn btn-primary btn-sm">
              + Add Account
            </Link>
          </div>
        ) : (
          accounts.map((account) => {
            const cycle = getCurrentCycle(account.type, account.createdAt);
            const dueDateStr = formatDueDate(account.dueDay, cycle.year, cycle.month);

            return (
              <div
                key={account.id}
                className={`card bg-base-200 shadow-sm ${!account.isActive ? "opacity-50" : ""}`}
              >
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{account.name}</h3>
                      <p className="text-sm opacity-70">
                        Due: {dueDateStr} •{" "}
                        {account.type === "recurring" ? "Recurring" : "One-time"} • Remind{" "}
                        {account.reminderDays} day{account.reminderDays === 1 ? "" : "s"} before
                      </p>
                      {!account.isActive && (
                        <span className="badge badge-neutral badge-sm mt-1">Inactive</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Link href={`/accounts/${account.id}/edit`} className="btn btn-ghost btn-sm">
                        Edit
                      </Link>
                      <DeleteAccountButton accountId={account.id} accountName={account.name} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6">
        <Link href="/" className="btn btn-ghost">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
