"use client";

import { AccountForm } from "@/components/account-form";
import { updateAccount } from "@/actions/accounts";
import Link from "next/link";
import { use } from "react";

export default function EditAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Account</h1>

      <div className="card bg-base-200">
        <div className="card-body">
          <AccountForm
            onSubmit={async (data) => {
              const result = await updateAccount({
                id,
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
