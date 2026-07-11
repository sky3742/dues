import { AccountForm } from "@/components/accounts/account-form";
import { updateAccount, getAccount } from "@/app/actions/accounts";
import { notFound } from "next/navigation";

export default async function EditAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = await getAccount(id);

  if (!account) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Account</h1>
          <p className="text-base-content/60">Update your payment account details</p>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-6">
            <AccountForm
              account={account}
              onSubmit={updateAccount.bind(null, { id: account.id })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
