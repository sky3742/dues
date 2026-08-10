"use client";

import { usePushSubscription } from "@/hooks/usePushSubscription";

export function PushSubscribe() {
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = usePushSubscription();

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
