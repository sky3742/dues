"use client";

import { togglePayment } from "@/actions/payments";
import { getCurrentCycle, getDaysUntilDue } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { motion } from "framer-motion";

type Account = {
  id: string;
  name: string;
  type: "recurring" | "one_time";
  dueDay: number;
  reminderDays: number;
  isActive: boolean;
  createdAt: string;
};

type Payment = {
  paid: boolean;
} | null;

type PaymentToggleProps = {
  account: Account;
  payment: Payment;
};

export function PaymentToggle({ account, payment }: PaymentToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isPaid = payment?.paid ?? false;
  const daysUntilDue = getDaysUntilDue(account.dueDay, account.type, account.createdAt);
  const cycle = getCurrentCycle(account.type, account.createdAt);

  const handleToggle = async () => {
    startTransition(async () => {
      await togglePayment(account.id, cycle.year, cycle.month);
      router.refresh();
    });
  };

  if (daysUntilDue === null && !isPaid) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="btn btn-sm btn-outline border-base-300 hover:border-warning hover:text-warning hover:bg-warning/10"
        onClick={handleToggle}
        disabled={isPending}
      >
        {isPending ? <span className="loading loading-spinner loading-xs" /> : "Mark Paid"}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`btn btn-sm transition-all duration-200 ${
        isPaid
          ? "btn-success"
          : "btn-outline border-base-300 hover:border-success hover:text-success hover:bg-success/10"
      }`}
      onClick={handleToggle}
      disabled={isPending}
    >
      {isPending ? (
        <span className="loading loading-spinner loading-xs" />
      ) : isPaid ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Paid
        </>
      ) : (
        "Mark Paid"
      )}
    </motion.button>
  );
}
