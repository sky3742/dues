import * as paymentsRepo from "@/repositories/payments";

export async function togglePayment(accountId: string, year: number, month: number) {
  const payment = await paymentsRepo.upsertPaidStatus(accountId, year, month);
  return { data: payment };
}

export async function getPaymentsForAccount(accountId: string) {
  return paymentsRepo.findPaymentsByAccountId(accountId);
}
