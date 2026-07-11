"use server";

import * as paymentService from "@/services/payment";
import { revalidatePath } from "next/cache";

export async function togglePayment(accountId: string, year: number, month: number) {
  const result = await paymentService.togglePayment(accountId, year, month);
  revalidatePath("/");
  return result;
}

export async function getPaymentsForAccount(accountId: string) {
  return paymentService.getPaymentsForAccount(accountId);
}
