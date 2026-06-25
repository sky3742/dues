"use client";

import { useState, useEffect } from "react";

export function PushAlert() {
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function check() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        return;
      }

      if (localStorage.getItem("push-alert-dismissed")) {
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          setShow(true);
        }
      } catch {
        // ignore
      }
    }
    check();
  }, []);

  async function enable() {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
      const padding = "=".repeat((4 - (key.length % 4)) % 4);
      const base64 = (key + padding).replace(/-/g, "+").replace(/_/g, "/");
      const raw = window.atob(base64);
      const arr = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: arr,
      });

      const serialized = JSON.parse(JSON.stringify(sub));
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: serialized.endpoint,
          p256dh: serialized.keys.p256dh,
          auth: serialized.keys.auth,
        }),
      });

      setShow(false);
    } catch (error) {
      console.error("Failed to subscribe:", error);
    } finally {
      setIsLoading(false);
    }
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
