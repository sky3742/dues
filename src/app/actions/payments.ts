"use server";

import * as paymentService from "@/services/payment";

export async function togglePayment(accountId: string, year: number, month: number) {
  return paymentService.togglePayment(accountId, year, month);
}

export async function getPaymentsForAccount(accountId: string) {
  return paymentService.getPaymentsForAccount(accountId);
}
