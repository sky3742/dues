"use server";

import { requireSession } from "@/services/auth";
import * as accountService from "@/services/account";
import * as accountsRepo from "@/repositories/accounts";
import * as paymentsRepo from "@/repositories/payments";

export async function createAccount(input: accountService.CreateAccountInput) {
  await requireSession();
  return accountService.createAccount(input);
}

export async function updateAccount(input: accountService.UpdateAccountInput) {
  await requireSession();
  return accountService.updateAccount(input);
}

export async function deleteAccount(id: string) {
  await requireSession();
  return accountService.deleteAccount(id);
}

export async function getAccounts() {
  await requireSession();
  return accountsRepo.findAllAccounts();
}

export async function getAccount(id: string) {
  await requireSession();
  return accountsRepo.findAccountById(id);
}

export async function getPaymentsForAccounts(accountIds: string[]) {
  await requireSession();
  return paymentsRepo.findPaymentsByAccountIds(accountIds);
}
