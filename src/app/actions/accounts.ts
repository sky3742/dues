"use server";

import * as accountService from "@/services/account";
import * as dashboardService from "@/services/dashboard";
import { findPaymentsByAccountIds } from "@/repositories/payments";
import { revalidatePath } from "next/cache";

export type CreateAccountInput = accountService.CreateAccountInput;
export type UpdateAccountInput = accountService.UpdateAccountInput;

export async function createAccount(input: CreateAccountInput) {
  const result = await accountService.createAccount(input);
  if (!result.error) {
    revalidatePath("/");
    revalidatePath("/accounts");
  }
  return result;
}

export async function updateAccount(input: UpdateAccountInput) {
  const result = await accountService.updateAccount(input);
  if (!result.error) {
    revalidatePath("/");
    revalidatePath("/accounts");
    revalidatePath(`/accounts/${input.id}/edit`);
  }
  return result;
}

export async function deleteAccount(id: string) {
  const result = await accountService.deleteAccount(id);
  if (!result.error) {
    revalidatePath("/");
    revalidatePath("/accounts");
  }
  return result;
}

export async function toggleAccountActive(id: string) {
  const result = await accountService.toggleAccountActive(id);
  if (!result.error) {
    revalidatePath("/");
    revalidatePath("/accounts");
  }
  return result;
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
  return findPaymentsByAccountIds(accountIds);
}
