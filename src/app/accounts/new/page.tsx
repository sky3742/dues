"use client";

import { AccountForm } from "@/components/account-form";
import { createAccount } from "@/actions/accounts";
import Link from "next/link";

export default function NewAccountPage() {
  return (
    <div className="container mx-auto max-w-2xl p-4">
      <h1 className="text-2xl font-bold mb-6">Create Account</h1>

      <div className="card bg-base-200">
        <div className="card-body">
          <AccountForm
            onSubmit={async (data) => {
              const result = await createAccount({
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
