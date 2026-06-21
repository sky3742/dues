import { createDb } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const db = createDb();
    const body = await request.json();
    const { endpoint, p256dh, auth } = body;

    if (!endpoint || !p256dh || !auth) {
      return Response.json({ error: "endpoint, p256dh, and auth are required" }, { status: 400 });
    }

    // Check if endpoint already exists
    const existing = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint))
      .limit(1);

    if (existing.length > 0) {
      return Response.json(existing[0]);
    }

    const [subscription] = await db
      .insert(pushSubscriptions)
      .values({
        endpoint,
        p256dh,
        auth,
        userAgent: request.headers.get("user-agent"),
      })
      .returning();

    return Response.json(subscription, { status: 201 });
  } catch (error) {
    console.error("Failed to save push subscription:", error);
    return Response.json({ error: "Failed to save push subscription" }, { status: 500 });
  }
}
