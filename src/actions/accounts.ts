"use server";

import { createDb } from "@/lib/db";
import { accounts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type CreateAccountInput = {
  name: string;
  type: "recurring" | "one_time";
  dueDay: number;
  reminderDays?: number;
};

export type UpdateAccountInput = Partial<CreateAccountInput> & { id: string };

export async function createAccount(input: CreateAccountInput) {
  if (!input.name || input.name.trim().length === 0) {
    return { error: "Name is required" };
  }
  if (input.dueDay < 1 || input.dueDay > 31) {
    return { error: "Due day must be between 1 and 31" };
  }

  const db = createDb();
  const [account] = await db
    .insert(accounts)
    .values({
      name: input.name.trim(),
      type: input.type,
      dueDay: input.dueDay,
      reminderDays: input.reminderDays ?? 3,
    })
    .returning();

  revalidatePath("/");
  revalidatePath("/accounts");
  return { data: account };
}

export async function updateAccount(input: UpdateAccountInput) {
  const { id, ...updates } = input;

  if (updates.name !== undefined && updates.name.trim().length === 0) {
    return { error: "Name cannot be empty" };
  }
  if (updates.dueDay !== undefined && (updates.dueDay < 1 || updates.dueDay > 31)) {
    return { error: "Due day must be between 1 and 31" };
  }

  const db = createDb();
  const [account] = await db
    .update(accounts)
    .set({
      ...updates,
      name: updates.name?.trim(),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(accounts.id, id))
    .returning();

  if (!account) {
    return { error: "Account not found" };
  }

  revalidatePath("/");
  revalidatePath("/accounts");
  revalidatePath(`/accounts/${id}/edit`);
  return { data: account };
}

export async function deleteAccount(id: string) {
  const db = createDb();
  const [account] = await db.delete(accounts).where(eq(accounts.id, id)).returning();

  if (!account) {
    return { error: "Account not found" };
  }

  revalidatePath("/");
  revalidatePath("/accounts");
  return { data: account };
}

export async function toggleAccountActive(id: string) {
  const db = createDb();
  const [existing] = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1);

  if (!existing) {
    return { error: "Account not found" };
  }

  const [account] = await db
    .update(accounts)
    .set({
      isActive: !existing.isActive,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(accounts.id, id))
    .returning();

  revalidatePath("/");
  revalidatePath("/accounts");
  return { data: account };
}

export async function getAccounts() {
  const db = createDb();
  const allAccounts = await db.select().from(accounts);
  return allAccounts;
}

export async function getAccount(id: string) {
  const db = createDb();
  const [account] = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
  return account ?? null;
}
