import { createDb } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const db = createDb();
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");

    if (!accountId) {
      return Response.json({ error: "accountId is required" }, { status: 400 });
    }

    const accountPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.accountId, accountId));

    return Response.json(accountPayments);
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    return Response.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}
