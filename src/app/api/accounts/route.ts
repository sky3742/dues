import { createDb } from "@/lib/db";
import { accounts } from "@/lib/db/schema";

export async function GET() {
  try {
    const db = createDb();
    const allAccounts = await db.select().from(accounts);
    return Response.json(allAccounts);
  } catch (error) {
    console.error("Failed to fetch accounts:", error);
    return Response.json({ error: "Failed to fetch accounts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = createDb();
    const body = await request.json();
    const { name, type, dueDay, reminderDays } = body;

    if (!name || !type || !dueDay) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (dueDay < 1 || dueDay > 31) {
      return Response.json({ error: "Due day must be between 1 and 31" }, { status: 400 });
    }

    const [account] = await db
      .insert(accounts)
      .values({
        name: name.trim(),
        type,
        dueDay,
        reminderDays: reminderDays ?? 3,
      })
      .returning();

    return Response.json(account, { status: 201 });
  } catch (error) {
    console.error("Failed to create account:", error);
    return Response.json({ error: "Failed to create account" }, { status: 500 });
  }
}
