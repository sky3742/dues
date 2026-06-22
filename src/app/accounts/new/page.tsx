"use client";

import { AccountForm } from "@/components/account-form";
import { createAccount } from "@/actions/accounts";
import { PageTransition } from "@/components/page-transition";

export default function NewAccountPage() {
  return (
    <PageTransition>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-base-content/60">Add a new payment account to track</p>
          </div>

          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-6">
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
        </div>
      </div>
    </PageTransition>
  );
}
