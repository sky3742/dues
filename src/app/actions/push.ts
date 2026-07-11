"use server";

import * as pushSubscriptionsRepo from "@/repositories/push-subscriptions";
import { revalidatePath } from "next/cache";

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

export async function unsubscribeFromPush(data: { endpoint: string }) {
  const { endpoint } = data;

  if (!endpoint) {
    return { error: "endpoint is required" };
  }

  await pushSubscriptionsRepo.deleteSubscriptionByEndpoint(endpoint);
  revalidatePath("/");
  return { data: { success: true } };
}
