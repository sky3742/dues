"use server";

import * as pushService from "@/services/push";
import { revalidatePath } from "next/cache";

export async function subscribeToPush(data: { endpoint: string; p256dh: string; auth: string }) {
  return pushService.subscribeToPush(data);
}

export async function unsubscribeFromPush(data: { endpoint: string }) {
  const result = await pushService.unsubscribeFromPush(data.endpoint);
  revalidatePath("/");
  return result;
}
