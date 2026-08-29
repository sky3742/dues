"use client";

import { updateAccount } from "@/app/actions/accounts";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type AccountStatusToggleProps = {
  accountId: string;
  accountName: string;
  isActive: boolean;
};

export function AccountStatusToggle({
  accountId,
  accountName,
  isActive,
}: AccountStatusToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const nextIsActive = !isActive;

  const handleToggle = () => {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await updateAccount({ id: accountId, isActive: nextIsActive });
      if (result.error) {
        setErrorMessage(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        className={`btn btn-xs ${isActive ? "btn-ghost" : "btn-warning btn-outline"}`}
        disabled={isPending}
        onClick={handleToggle}
        aria-label={`${nextIsActive ? "Activate" : "Deactivate"} ${accountName}`}
        title={`${nextIsActive ? "Activate" : "Deactivate"} account`}
      >
        {isPending ? <span className="loading loading-spinner loading-xs" /> : null}
        {isPending ? "Saving..." : nextIsActive ? "Activate" : "Deactivate"}
      </button>
      {errorMessage ? (
        <span className="absolute right-0 top-full z-10 mt-1 whitespace-nowrap text-xs text-error">
          {errorMessage}
        </span>
      ) : null}
    </div>
  );
}
