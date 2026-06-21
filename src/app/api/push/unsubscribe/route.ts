import { createDb } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const db = createDb();
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return Response.json({ error: "endpoint is required" }, { status: 400 });
    }

    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to remove push subscription:", error);
    return Response.json({ error: "Failed to remove push subscription" }, { status: 500 });
  }
}
