"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { deleteAccount } from "@/app/actions/accounts";

type DeleteAccountButtonProps = {
  accountId: string;
  accountName: string;
};

export function DeleteAccountButton({ accountId, accountName }: DeleteAccountButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteAccount(accountId);
      if (!result.error) {
        router.refresh();
      }
      setShowConfirm(false);
    });
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 animate-scale-in-up">
        <span className="text-xs text-error font-medium">Delete {accountName}?</span>
        <button
          className="btn btn-error btn-xs active:scale-95 transition-transform"
          onClick={handleDelete}
          disabled={isPending}
        >
          {isPending ? <span className="loading loading-spinner loading-xs" /> : "Yes"}
        </button>
        <button
          className="btn btn-ghost btn-xs active:scale-95 transition-transform"
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      className="btn btn-ghost btn-sm text-error hover:bg-error/10 active:scale-95 transition-transform"
      onClick={() => setShowConfirm(true)}
    >
      Delete
    </button>
  );
}
