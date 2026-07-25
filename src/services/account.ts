import * as accountsRepo from "@/repositories/accounts";
import * as paymentsRepo from "@/repositories/payments";
import { accountSchema, type AccountInput } from "@/schemas";

export type CreateAccountInput = AccountInput;
export type UpdateAccountInput = Partial<AccountInput> & { id: string };

export async function createAccount(input: CreateAccountInput) {
  const result = accountSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const account = await accountsRepo.insertAccount({
    name: result.data.name.trim(),
    type: result.data.type,
    dueDay: result.data.dueDay,
    reminderDays: result.data.reminderDays ?? 3,
  });

  return { data: account };
}

export async function updateAccount(input: UpdateAccountInput) {
  const { id, ...updates } = input;

  const result = accountSchema.partial().safeParse(updates);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const account = await accountsRepo.updateAccount(id, {
    ...result.data,
    name: result.data.name?.trim(),
  });

  if (!account) {
    return { error: "Account not found" };
  }

  return { data: account };
}

export async function deleteAccount(id: string) {
  const account = await accountsRepo.deleteAccount(id);
  if (!account) {
    return { error: "Account not found" };
  }
  return { data: account };
}

export async function getAccounts() {
  return accountsRepo.findAllAccounts();
}

export async function getAccount(id: string) {
  return accountsRepo.findAccountById(id);
}

export async function getPaymentsForAccounts(accountIds: string[]) {
  return paymentsRepo.findPaymentsByAccountIds(accountIds);
}
