"use server";

import { createDb } from "@/lib/db";
import { accounts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { accountSchema, type AccountInput } from "@/lib/schemas";

export type CreateAccountInput = AccountInput;

export type UpdateAccountInput = Partial<AccountInput> & { id: string };

export async function createAccount(input: CreateAccountInput) {
  const result = accountSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const db = createDb();
  const [account] = await db
    .insert(accounts)
    .values({
      name: result.data.name.trim(),
      type: result.data.type,
      dueDay: result.data.dueDay,
      reminderDays: result.data.reminderDays ?? 3,
    })
    .returning();

  revalidatePath("/");
  revalidatePath("/accounts");
  return { data: account };
}

export async function updateAccount(input: UpdateAccountInput) {
  const { id, ...updates } = input;

  const result = accountSchema.partial().safeParse(updates);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const db = createDb();
  const [account] = await db
    .update(accounts)
    .set({
      ...result.data,
      name: result.data.name?.trim(),
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
  const allAccounts = await db.select().from(accounts).orderBy(accounts.name);
  return allAccounts;
}

export async function getAccount(id: string) {
  const db = createDb();
  const [account] = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
  return account ?? null;
}
