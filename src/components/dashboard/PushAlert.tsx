"use client";

import { useState, useEffect } from "react";
import { usePushSubscription } from "@/hooks/usePushSubscription";

export function PushAlert() {
  const [show, setShow] = useState(false);
  const { isSupported, isSubscribed, isLoading, subscribe } = usePushSubscription();

  useEffect(() => {
    async function check() {
      if (!isSupported || isSubscribed) return;
      if (localStorage.getItem("push-alert-dismissed")) return;
      setShow(true);
    }
    check();
  }, [isSupported, isSubscribed]);

  async function enable() {
    const ok = await subscribe();
    if (ok) setShow(false);
  }

  function dismiss() {
    localStorage.setItem("push-alert-dismissed", "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="alert alert-warning mb-6">
      <span>Notifications are off — you won&apos;t get reminder alerts.</span>
      <div className="flex gap-2">
        <button className="btn btn-sm btn-primary" onClick={enable} disabled={isLoading}>
          {isLoading ? <span className="loading loading-spinner loading-xs" /> : "Enable"}
        </button>
        <button className="btn btn-sm btn-ghost" onClick={dismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
