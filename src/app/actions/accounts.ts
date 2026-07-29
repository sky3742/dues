"use server";

import { requireSession } from "@/services/auth";
import * as accountService from "@/services/account";
import * as dashboardService from "@/services/dashboard";

export type CreateAccountInput = accountService.CreateAccountInput;
export type UpdateAccountInput = accountService.UpdateAccountInput;

export async function createAccount(input: CreateAccountInput) {
  await requireSession();
  return accountService.createAccount(input);
}

export async function updateAccount(input: UpdateAccountInput) {
  await requireSession();
  return accountService.updateAccount(input);
}

export async function deleteAccount(id: string) {
  await requireSession();
  return accountService.deleteAccount(id);
}

export async function getAccounts() {
  await requireSession();
  return accountService.getAccounts();
}

export async function getAccount(id: string) {
  await requireSession();
  return accountService.getAccount(id);
}

export async function getDashboardStats() {
  await requireSession();
  return dashboardService.getDashboardStats();
}

export async function getPaymentsForAccounts(accountIds: string[]) {
  await requireSession();
  return accountService.getPaymentsForAccounts(accountIds);
}
