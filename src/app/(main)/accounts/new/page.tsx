import { AccountForm } from "@/components/accounts/AccountForm";
import { createAccount } from "@/app/actions/accounts";
import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";

export default async function NewAccountPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-base-content/60">Add a new payment account to track</p>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-6">
            <AccountForm onSubmit={createAccount} />
          </div>
        </div>
      </div>
    </div>
  );
}
