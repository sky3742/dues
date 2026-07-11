import * as accountsRepo from "@/repositories/accounts";
import * as paymentsRepo from "@/repositories/payments";
import { accountSchema, type AccountInput } from "@/schemas";
import { getDaysUntilDue, getNextDueDate } from "@/utils";

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

export async function toggleAccountActive(id: string) {
  const existing = await accountsRepo.findAccountById(id);
  if (!existing) {
    return { error: "Account not found" };
  }

  const account = await accountsRepo.updateAccount(id, {
    isActive: !existing.isActive,
  });

  return { data: account };
}

export async function getAccounts() {
  return accountsRepo.findAllAccounts();
}

export async function getAccount(id: string) {
  return accountsRepo.findAccountById(id);
}

export type DashboardStats = {
  activeCount: number;
  overdueCount: number;
  dueSoonCount: number;
  paidCount: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const allAccounts = await accountsRepo.findAllAccounts();
  const activeAccounts = allAccounts.filter((a) => a.isActive);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const accountMeta = activeAccounts.map((account) => {
    const nextDue = getNextDueDate(account.dueDay, account.type, account.createdAt);
    const daysUntilNextDue = nextDue
      ? Math.round((nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    const inStatementWindow = daysUntilNextDue !== null && daysUntilNextDue <= 20;

    if (inStatementWindow && nextDue) {
      return {
        account,
        cycle: { year: nextDue.getFullYear(), month: nextDue.getMonth() + 1 },
        daysUntilDue: daysUntilNextDue,
      };
    }
    return {
      account,
      cycle: { year: now.getFullYear(), month: now.getMonth() + 1 },
      daysUntilDue: getDaysUntilDue(account.dueDay, account.type, account.createdAt),
    };
  });

  const accountIds = activeAccounts.map((a) => a.id);
  const allPayments = await paymentsRepo.findPaymentsByAccountIds(accountIds);
  const paymentMap = new Map(allPayments.map((p) => [`${p.accountId}:${p.year}:${p.month}`, p]));

  let overdueCount = 0;
  let dueSoonCount = 0;
  let paidCount = 0;

  for (const { account, cycle, daysUntilDue } of accountMeta) {
    const payment = paymentMap.get(`${account.id}:${cycle.year}:${cycle.month}`);

    if (payment?.paid) {
      paidCount++;
      continue;
    }

    if (daysUntilDue !== null) {
      if (daysUntilDue < 0) {
        overdueCount++;
      } else if (daysUntilDue <= account.reminderDays) {
        dueSoonCount++;
      }
    }
  }

  return {
    activeCount: activeAccounts.length,
    overdueCount,
    dueSoonCount,
    paidCount,
  };
}
