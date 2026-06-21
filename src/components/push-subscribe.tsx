"use client";

import { useState, useEffect } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

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

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: serializedSub.endpoint,
          p256dh: serializedSub.keys.p256dh,
          auth: serializedSub.keys.auth,
        }),
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

        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint }),
        });
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
      <div className="alert alert-info">
        <span>Push notifications are not supported in this browser.</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">
        {isSubscribed ? "Push notifications enabled" : "Push notifications disabled"}
      </span>
      <button
        className={`btn btn-sm ${isSubscribed ? "btn-error" : "btn-primary"}`}
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
