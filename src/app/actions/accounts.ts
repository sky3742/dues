"use server";

import * as accountService from "@/services/account";
import * as dashboardService from "@/services/dashboard";

export type CreateAccountInput = accountService.CreateAccountInput;
export type UpdateAccountInput = accountService.UpdateAccountInput;

export async function createAccount(input: CreateAccountInput) {
  return accountService.createAccount(input);
}

export async function updateAccount(input: UpdateAccountInput) {
  return accountService.updateAccount(input);
}

export async function deleteAccount(id: string) {
  return accountService.deleteAccount(id);
}

export async function getAccounts() {
  return accountService.getAccounts();
}

export async function getAccount(id: string) {
  return accountService.getAccount(id);
}

export async function getDashboardStats() {
  return dashboardService.getDashboardStats();
}

export async function getPaymentsForAccounts(accountIds: string[]) {
  return accountService.getPaymentsForAccounts(accountIds);
}
