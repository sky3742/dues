import { createDb } from "@/db";
import { payments } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function findPaymentForCycle(accountId: string, year: number, month: number) {
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

export async function findPaymentsByAccountId(accountId: string) {
  const db = createDb();
  return db
    .select()
    .from(payments)
    .where(eq(payments.accountId, accountId))
    .orderBy(payments.year, payments.month);
}

export async function findPaymentsByAccountIds(accountIds: string[]) {
  if (accountIds.length === 0) return [];
  const db = createDb();
  return db.select().from(payments).where(inArray(payments.accountId, accountIds));
}

export async function upsertPaidStatus(accountId: string, year: number, month: number) {
  const db = createDb();

  const [existing] = await db
    .select()
    .from(payments)
    .where(
      and(eq(payments.accountId, accountId), eq(payments.year, year), eq(payments.month, month))
    )
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(payments)
      .set({
        paid: !existing.paid,
        paidAt: !existing.paid ? new Date().toISOString() : null,
      })
      .where(eq(payments.id, existing.id))
      .returning();
    return updated;
  }

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
  return created;
}
