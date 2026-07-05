"use server";

import { createDb } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function togglePayment(accountId: string, year: number, month: number) {
  const db = createDb();

  // Find existing payment record
  const [existing] = await db
    .select()
    .from(payments)
    .where(
      and(eq(payments.accountId, accountId), eq(payments.year, year), eq(payments.month, month))
    )
    .limit(1);

  if (existing) {
    // Toggle paid status
    const [updated] = await db
      .update(payments)
      .set({
        paid: !existing.paid,
        paidAt: !existing.paid ? new Date().toISOString() : null,
      })
      .where(eq(payments.id, existing.id))
      .returning();

    revalidatePath("/");
    return { data: updated };
  }

  // Create new payment record (marking as paid)
  const [created] = await db
    .insert(payments)
    .values({
      accountId,
      year,
      month,
      paid: true,
      paidAt: new Date().toISOString(),
    })
    .returning();

  revalidatePath("/");
  return { data: created };
}

export async function getPaymentsForAccount(accountId: string) {
  const db = createDb();
  const accountPayments = await db
    .select()
    .from(payments)
    .where(eq(payments.accountId, accountId))
    .orderBy(payments.year, payments.month);

  return accountPayments;
}

export async function getPaymentForCycle(accountId: string, year: number, month: number) {
  const db = createDb();
  const [payment] = await db
    .select()
    .from(payments)
    .where(
      and(eq(payments.accountId, accountId), eq(payments.year, year), eq(payments.month, month))
    )
    .limit(1);

  return payment ?? null;
}
