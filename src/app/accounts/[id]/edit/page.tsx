import { AccountForm } from "@/components/account-form";
import { updateAccount, getAccount } from "@/actions/accounts";
import { notFound } from "next/navigation";
import { PageTransition } from "@/components/page-transition";

export default async function EditAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = await getAccount(id);

  if (!account) {
    notFound();
  }

  return (
    <PageTransition>
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
        </div>
      </div>
    </PageTransition>
  );
}
