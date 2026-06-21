"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { deleteAccount } from "@/actions/accounts";

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
      <div className="flex items-center gap-1">
        <span className="text-xs text-error">Delete?</span>
        <button className="btn btn-error btn-xs" onClick={handleDelete} disabled={isPending}>
          {isPending ? <span className="loading loading-spinner loading-xs" /> : "Yes"}
        </button>
        <button
          className="btn btn-ghost btn-xs"
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button className="btn btn-ghost btn-sm text-error" onClick={() => setShowConfirm(true)}>
      Delete
    </button>
  );
}
