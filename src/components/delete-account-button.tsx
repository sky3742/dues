"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { deleteAccount } from "@/actions/accounts";
import { motion, AnimatePresence } from "framer-motion";

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

  return (
    <AnimatePresence mode="wait">
      {showConfirm ? (
        <motion.div
          key="confirm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-center gap-2"
        >
          <span className="text-xs text-error font-medium">Delete {accountName}?</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-error btn-xs"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? <span className="loading loading-spinner loading-xs" /> : "Yes"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-ghost btn-xs"
            onClick={() => setShowConfirm(false)}
            disabled={isPending}
          >
            No
          </motion.button>
        </motion.div>
      ) : (
        <motion.button
          key="delete"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-ghost btn-sm text-error hover:bg-error/10"
          onClick={() => setShowConfirm(true)}
        >
          Delete
        </motion.button>
      )}
    </AnimatePresence>
  );
}
