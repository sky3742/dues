import * as pushSubscriptionsRepo from "@/repositories/pushSubscriptions";
import webPush from "web-push";
import type { PushSubscription } from "web-push";

// Configure VAPID keys
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:localhost@localhost",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

type PushPayload = {
  title: string;
  body: string;
  icon?: string;
};

export async function subscribeToPush(data: { endpoint: string; p256dh: string; auth: string }) {
  const { endpoint, p256dh, auth } = data;

  if (!endpoint || !p256dh || !auth) {
    return { error: "endpoint, p256dh, and auth are required" };
  }

  const existing = await pushSubscriptionsRepo.findSubscriptionByEndpoint(endpoint);
  if (existing) {
    return { data: existing };
  }

  const subscription = await pushSubscriptionsRepo.insertSubscription({
    endpoint,
    p256dh,
    auth,
  });

  return { data: subscription };
}

export async function unsubscribeFromPush(endpoint: string) {
  if (!endpoint) {
    return { error: "endpoint is required" };
  }

  await pushSubscriptionsRepo.deleteSubscriptionByEndpoint(endpoint);
  return { data: { success: true } };
}

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushPayload
): Promise<boolean> {
  try {
    await webPush.sendNotification(subscription, JSON.stringify(payload), {
      TTL: 60 * 60 * 24, // 24 hours
    });
    return true;
  } catch (error) {
    console.error("Failed to send push notification:", error);
    return false;
  }
}

export async function sendPushToAll(
  subscriptions: PushSubscription[],
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    const success = await sendPushNotification(sub, payload);
    if (success) {
      sent++;
    } else {
      failed++;
    }
  }

  return { sent, failed };
}
