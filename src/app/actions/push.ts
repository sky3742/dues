"use server";

import * as pushService from "@/services/push";

export async function subscribeToPush(data: { endpoint: string; p256dh: string; auth: string }) {
  return pushService.subscribeToPush(data);
}

export async function unsubscribeFromPush(data: { endpoint: string }) {
  return pushService.unsubscribeFromPush(data.endpoint);
}
