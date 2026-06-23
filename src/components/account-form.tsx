"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { motion } from "framer-motion";

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="label mb-1.5">
          <span className="label-text font-medium">Name</span>
        </label>
        <input
          type="text"
          name="name"
          defaultValue={account?.name}
          placeholder="e.g. Rent, Internet, Netflix"
          className="input input-bordered w-full focus:input-primary transition-colors"
          required
        />
        <label className="label">
          <span className="label-text-alt text-base-content/50">
            A name to identify this payment
          </span>
        </label>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
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
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="label mb-1.5">
            <span className="label-text font-medium">Due Day</span>
          </label>
          <input
            type="number"
            name="dueDay"
            defaultValue={account?.dueDay ?? 1}
            min={1}
            max={31}
            className="input input-bordered w-full focus:input-primary transition-colors"
            required
          />
          <label className="label">
            <span className="label-text-alt text-base-content/50">1-31</span>
          </label>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <label className="label mb-1.5">
            <span className="label-text font-medium">Remind me</span>
          </label>
          <input
            type="number"
            name="reminderDays"
            defaultValue={account?.reminderDays ?? 3}
            min={0}
            max={30}
            className="input input-bordered w-full focus:input-primary transition-colors"
            required
          />
          <label className="label">
            <span className="label-text-alt text-base-content/50">Days before due</span>
          </label>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-3 justify-end mt-4 pt-4 border-t border-base-300"
      >
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </button>
        <motion.button
          type="submit"
          className="btn btn-primary min-w-[120px]"
          disabled={isPending}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isPending ? (
            <span className="loading loading-spinner loading-sm" />
          ) : account?.id ? (
            "Update Account"
          ) : (
            "Create Account"
          )}
        </motion.button>
      </motion.div>
    </form>
  );
}
