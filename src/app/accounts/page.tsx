export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAccounts } from "@/actions/accounts";

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
          <div className="alert alert-info">
            <span>No accounts yet. Click &quot;+ Add&quot; to create one.</span>
          </div>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              className={`card bg-base-200 shadow-sm ${!account.isActive ? "opacity-50" : ""}`}
            >
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">{account.name}</h3>
                    <p className="text-sm opacity-70">
                      Day {account.dueDay} •{" "}
                      {account.type === "recurring" ? "Recurring" : "One-time"} • Remind{" "}
                      {account.reminderDays} day{account.reminderDays === 1 ? "" : "s"} before
                    </p>
                    {!account.isActive && (
                      <span className="badge badge-neutral badge-sm mt-1">Inactive</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/accounts/${account.id}/edit`} className="btn btn-ghost btn-sm">
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
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
