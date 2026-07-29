"use server";

import { requireSession } from "@/services/auth";
import * as paymentService from "@/services/payment";

export async function togglePayment(accountId: string, year: number, month: number) {
  await requireSession();
  return paymentService.togglePayment(accountId, year, month);
}

export async function getPaymentsForAccount(accountId: string) {
  await requireSession();
  return paymentService.getPaymentsForAccount(accountId);
}
