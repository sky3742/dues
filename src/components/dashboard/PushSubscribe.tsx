"use client";

import { useState, useEffect } from "react";
import { subscribeToPush, unsubscribeFromPush } from "@/app/actions/push";
import { urlBase64ToUint8Array } from "@/utils/vapid";

export function PushSubscribe() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function init() {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        setIsSupported(true);
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        } catch {
          console.error("Failed to check subscription");
        }
      }
    }
    init();
  }, []);

  async function subscribe() {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });

      const serializedSub = JSON.parse(JSON.stringify(subscription));

      await subscribeToPush({
        endpoint: serializedSub.endpoint,
        p256dh: serializedSub.keys.p256dh,
        auth: serializedSub.keys.auth,
      });

      setIsSubscribed(true);
    } catch (error) {
      console.error("Failed to subscribe:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function unsubscribe() {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await unsubscribeFromPush({ endpoint });
      }

      setIsSubscribed(false);
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isSupported) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-base-200/50">
        <span className="text-xl">🔔</span>
        <div>
          <p className="font-medium">Push Notifications</p>
          <p className="text-sm text-base-content/60">
            Push notifications are not supported in this browser.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isSubscribed ? "bg-success/10" : "bg-base-content/5"
          }`}
        >
          <span className="text-xl">{isSubscribed ? "🔔" : "🔕"}</span>
        </div>
        <div>
          <p className="font-medium">Push Notifications</p>
          <p className="text-sm text-base-content/60">
            {isSubscribed
              ? "You will receive reminders before due dates"
              : "Enable to receive reminders before due dates"}
          </p>
        </div>
      </div>
      <button
        className={`btn btn-sm active:scale-95 transition-transform ${isSubscribed ? "btn-error" : "btn-primary"}`}
        onClick={isSubscribed ? unsubscribe : subscribe}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="loading loading-spinner loading-xs" />
        ) : isSubscribed ? (
          "Disable"
        ) : (
          "Enable"
        )}
      </button>
    </div>
  );
}
