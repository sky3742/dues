"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSchema, type AccountInput } from "@/lib/schemas";

type AccountFormProps = {
  account?: AccountInput & { id?: string };
  onSubmit: (data: AccountInput) => Promise<{ error?: string }>;
};

export function AccountForm({ account, onSubmit }: AccountFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountInput>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: account?.name ?? "",
      type: account?.type ?? "recurring",
      dueDay: account?.dueDay ?? 1,
      reminderDays: account?.reminderDays ?? 3,
    },
  });

  const onFormSubmit = (data: AccountInput) => {
    startTransition(async () => {
      const result = await onSubmit(data);
      if (result.error) {
        alert(result.error);
      } else {
        router.push("/accounts");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-5">
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
          placeholder="e.g. Rent, Internet, Netflix"
          className={`input input-bordered w-full focus:input-primary transition-colors ${errors.name ? "input-error" : ""}`}
          {...register("name")}
        />
        {errors.name && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.name.message}</span>
          </label>
        )}
        {!errors.name && (
          <label className="label">
            <span className="label-text-alt text-base-content/50">
              A name to identify this payment
            </span>
          </label>
        )}
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
          className="select select-bordered w-full focus:select-primary transition-colors"
          {...register("type")}
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
            min={1}
            max={31}
            className={`input input-bordered w-full focus:input-primary transition-colors ${errors.dueDay ? "input-error" : ""}`}
            {...register("dueDay", { valueAsNumber: true })}
          />
          {errors.dueDay ? (
            <label className="label">
              <span className="label-text-alt text-error">{errors.dueDay.message}</span>
            </label>
          ) : (
            <label className="label">
              <span className="label-text-alt text-base-content/50">1-31</span>
            </label>
          )}
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
            min={0}
            max={30}
            className={`input input-bordered w-full focus:input-primary transition-colors ${errors.reminderDays ? "input-error" : ""}`}
            {...register("reminderDays", { valueAsNumber: true })}
          />
          {errors.reminderDays ? (
            <label className="label">
              <span className="label-text-alt text-error">{errors.reminderDays.message}</span>
            </label>
          ) : (
            <label className="label">
              <span className="label-text-alt text-base-content/50">Days before due</span>
            </label>
          )}
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
