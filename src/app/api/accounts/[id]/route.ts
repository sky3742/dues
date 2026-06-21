import { createDb } from "@/lib/db";
import { accounts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = createDb();
    const { id } = await params;
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1);

    if (!account) {
      return Response.json({ error: "Account not found" }, { status: 404 });
    }

    return Response.json(account);
  } catch (error) {
    console.error("Failed to fetch account:", error);
    return Response.json({ error: "Failed to fetch account" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = createDb();
    const { id } = await params;
    const body = await request.json();
    const { name, type, dueDay, reminderDays, isActive } = body;

    const [account] = await db
      .update(accounts)
      .set({
        ...(name !== undefined && { name: name.trim() }),
        ...(type !== undefined && { type }),
        ...(dueDay !== undefined && { dueDay }),
        ...(reminderDays !== undefined && { reminderDays }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(accounts.id, id))
      .returning();

    if (!account) {
      return Response.json({ error: "Account not found" }, { status: 404 });
    }

    return Response.json(account);
  } catch (error) {
    console.error("Failed to update account:", error);
    return Response.json({ error: "Failed to update account" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = createDb();
    const { id } = await params;
    const [account] = await db.delete(accounts).where(eq(accounts.id, id)).returning();

    if (!account) {
      return Response.json({ error: "Account not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete account:", error);
    return Response.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
