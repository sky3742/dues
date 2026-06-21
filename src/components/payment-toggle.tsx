"use client";

import { togglePayment } from "@/actions/payments";
import { getCurrentCycle, getDaysUntilDue } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

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

  if (daysUntilDue === null) {
    return <span className="badge badge-neutral badge-sm">Past due</span>;
  }

  return (
    <button
      className={`btn btn-sm ${isPaid ? "btn-success" : "btn-outline"}`}
      onClick={handleToggle}
      disabled={isPending}
    >
      {isPending ? (
        <span className="loading loading-spinner loading-xs" />
      ) : isPaid ? (
        "Paid"
      ) : (
        "Mark Paid"
      )}
    </button>
  );
}
