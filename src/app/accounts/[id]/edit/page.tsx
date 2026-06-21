import { AccountForm } from "@/components/account-form";
import { updateAccount, getAccount } from "@/actions/accounts";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = await getAccount(id);

  if (!account) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Account</h1>

      <div className="card bg-base-200">
        <div className="card-body">
          <AccountForm
            account={account}
            onSubmit={async (data) => {
              "use server";
              const result = await updateAccount({
                id: account.id,
                name: data.name,
                type: data.type,
                dueDay: data.dueDay,
                reminderDays: data.reminderDays,
              });
              return result;
            }}
          />
        </div>
      </div>

      <div className="mt-6">
        <Link href="/accounts" className="btn btn-ghost">
          ← Back to Accounts
        </Link>
      </div>
    </div>
  );
}
