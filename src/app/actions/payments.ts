"use server";

import { requireSession } from "@/services/auth";
import * as paymentsRepo from "@/repositories/payments";

export async function togglePayment(accountId: string, year: number, month: number) {
  await requireSession();
  return paymentsRepo.upsertPaidStatus(accountId, year, month);
}
