import { createDb } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const db = createDb();
    const body = await request.json();
    const { accountId, year, month } = body;

    if (!accountId || !year || !month) {
      return Response.json({ error: "accountId, year, and month are required" }, { status: 400 });
    }

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

      return Response.json(updated);
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

    return Response.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to toggle payment:", error);
    return Response.json({ error: "Failed to toggle payment" }, { status: 500 });
  }
}
