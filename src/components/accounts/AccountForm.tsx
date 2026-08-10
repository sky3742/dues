"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import type { AccountInput } from "@/schemas/account";

type AccountFormProps = {
  account?: AccountInput & { id?: string };
  onSubmit: (data: AccountInput) => Promise<{ error?: string }>;
};

export function AccountForm({ account, onSubmit }: AccountFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await onSubmit({
        name: String(form.get("name") || ""),
        type: form.get("type") as "recurring" | "one_time",
        dueDay: Number(form.get("dueDay")),
        reminderDays: Number(form.get("reminderDays")),
      });
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        router.push("/accounts");
      }
    });
  };

  return (
    <form onSubmit={onFormSubmit} className="flex flex-col gap-5">
      {errorMessage && (
        <p className="text-sm text-error" role="alert">
          {errorMessage}
        </p>
      )}

      <div>
        <label className="label mb-1.5">
          <span className="label-text font-medium">Name</span>
        </label>
        <input
          type="text"
          name="name"
          placeholder="e.g. Rent, Internet, Netflix"
          defaultValue={account?.name ?? ""}
          className="input input-bordered w-full focus:input-primary transition-colors"
        />
        <label className="label">
          <span className="label-text-alt text-base-content/50">
            A name to identify this payment
          </span>
        </label>
      </div>

      <div>
        <label className="label mb-1.5">
          <span className="label-text font-medium">Type</span>
        </label>
        <select
          name="type"
          defaultValue={account?.type ?? "recurring"}
          className="select select-bordered w-full focus:select-primary transition-colors"
        >
          <option value="recurring">Recurring (monthly)</option>
          <option value="one_time">One-time</option>
        </select>
        <label className="label">
          <span className="label-text-alt text-base-content/50 text-wrap">
            Recurring repeats each month, one-time is a single payment
          </span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label mb-1.5">
            <span className="label-text font-medium">Due Day</span>
          </label>
          <input
            type="number"
            name="dueDay"
            min={1}
            max={31}
            defaultValue={account?.dueDay ?? 1}
            className="input input-bordered w-full focus:input-primary transition-colors"
          />
          <label className="label">
            <span className="label-text-alt text-base-content/50">1-31</span>
          </label>
        </div>

        <div>
          <label className="label mb-1.5">
            <span className="label-text font-medium">Remind me</span>
          </label>
          <input
            type="number"
            name="reminderDays"
            min={0}
            max={30}
            defaultValue={account?.reminderDays ?? 3}
            className="input input-bordered w-full focus:input-primary transition-colors"
          />
          <label className="label">
            <span className="label-text-alt text-base-content/50">Days before due</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-base-300">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary min-w-[120px]" disabled={isPending}>
          {isPending ? (
            <span className="loading loading-spinner loading-sm" />
          ) : account?.id ? (
            "Update Account"
          ) : (
            "Create Account"
          )}
        </button>
      </div>
    </form>
  );
}
