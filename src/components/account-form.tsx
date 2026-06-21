"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Account = {
  id?: string;
  name: string;
  type: "recurring" | "one_time";
  dueDay: number;
  reminderDays: number;
};

type AccountFormProps = {
  account?: Account;
  onSubmit: (data: Account) => Promise<{ error?: string }>;
};

export function AccountForm({ account, onSubmit }: AccountFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await onSubmit({
        id: account?.id,
        name: formData.get("name") as string,
        type: formData.get("type") as "recurring" | "one_time",
        dueDay: parseInt(formData.get("dueDay") as string, 10),
        reminderDays: parseInt(formData.get("reminderDays") as string, 10),
      });

      if (result.error) {
        alert(result.error);
      } else {
        router.push("/accounts");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Name</span>
        </label>
        <input
          type="text"
          name="name"
          defaultValue={account?.name}
          placeholder="e.g. Rent, Internet"
          className="input input-bordered w-full"
          required
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Type</span>
        </label>
        <select
          name="type"
          defaultValue={account?.type ?? "recurring"}
          className="select select-bordered w-full"
        >
          <option value="recurring">Recurring (monthly)</option>
          <option value="one_time">One-time</option>
        </select>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Due Day (1-31)</span>
        </label>
        <input
          type="number"
          name="dueDay"
          defaultValue={account?.dueDay ?? 1}
          min={1}
          max={31}
          className="input input-bordered w-full"
          required
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Remind me (days before)</span>
        </label>
        <input
          type="number"
          name="reminderDays"
          defaultValue={account?.reminderDays ?? 3}
          min={0}
          max={30}
          className="input input-bordered w-full"
          required
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" className="btn btn-ghost" onClick={() => router.back()}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? (
            <span className="loading loading-spinner loading-xs" />
          ) : account?.id ? (
            "Update"
          ) : (
            "Create"
          )}
        </button>
      </div>
    </form>
  );
}
