import { createDb } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

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
