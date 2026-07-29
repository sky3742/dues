"use server";

import { requireSession } from "@/services/auth";
import * as pushService from "@/services/push";

export async function subscribeToPush(data: { endpoint: string; p256dh: string; auth: string }) {
  await requireSession();
  return pushService.subscribeToPush(data);
}

export async function unsubscribeFromPush(data: { endpoint: string }) {
  await requireSession();
  return pushService.unsubscribeFromPush(data.endpoint);
}
