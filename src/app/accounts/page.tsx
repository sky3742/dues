export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAccounts } from "@/actions/accounts";
import { formatDueDate, getCurrentCycle } from "@/lib/utils";
import { DeleteAccountButton } from "@/components/delete-account-button";
import { PageTransition } from "@/components/page-transition";

export default async function AccountsPage() {
  const accounts = await getAccounts();

  return (
    <PageTransition>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Accounts</h1>
            <p className="text-base-content/60">Manage your payment accounts</p>
          </div>
          <Link href="/accounts/new" className="btn btn-primary btn-sm gap-1">
            <span className="text-lg leading-none">+</span>
            <span>Add Account</span>
          </Link>
        </div>

        {accounts.length === 0 ? (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body items-center text-center py-16">
              <div className="text-6xl mb-4 animate-pulse-soft">📂</div>
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
            {accounts.map((account, index) => {
              const cycle = getCurrentCycle(account.type, account.createdAt);
              const dueDateStr = formatDueDate(account.dueDay, cycle.year, cycle.month);

              return (
                <div
                  key={account.id}
                  className={`stagger-item card bg-base-100 shadow-sm card-hover border border-base-300/50 ${
                    !account.isActive ? "opacity-60" : ""
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="card-body p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          {account.type === "recurring" ? "🔄" : "📝"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{account.name}</h3>
                            {!account.isActive && (
                              <span className="badge badge-ghost badge-sm">Inactive</span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-base-content/60">
                            <span>Due: {dueDateStr}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{account.type === "recurring" ? "Monthly" : "One-time"}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>Remind {account.reminderDays}d before</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 ml-13 sm:ml-0">
                        <Link
                          href={`/accounts/${account.id}/edit`}
                          className="btn btn-ghost btn-sm"
                        >
                          Edit
                        </Link>
                        <DeleteAccountButton accountId={account.id} accountName={account.name} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
