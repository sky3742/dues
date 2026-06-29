import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createDb } from "@/lib/db";
import { accounts, pushSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendPushToAll } from "@/lib/push";
import { getDaysUntilDue, getCurrentCycle } from "@/lib/utils";
import { getPaymentForCycle } from "@/actions/payments";

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Also verify Vercel cron header
  const vercelCron = request.headers.get("x-vercel-cron");
  if (!cronSecret && !vercelCron) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = createDb();

    // Fetch all active accounts
    const activeAccounts = await db.select().from(accounts).where(eq(accounts.isActive, true));

    // Fetch all push subscriptions and map to web-push format
    const dbSubscriptions = await db.select().from(pushSubscriptions);
    const subscriptions = dbSubscriptions.map((sub) => ({
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    }));

    if (subscriptions.length === 0) {
      return NextResponse.json({
        accountsChecked: activeAccounts.length,
        notificationsSent: 0,
        message: "No push subscriptions found",
      });
    }

    let notificationsSent = 0;

    for (const account of activeAccounts) {
      const daysUntilDue = getDaysUntilDue(account.dueDay, account.type, account.createdAt);

      // Skip if no due date (one-time past due) or overdue
      if (daysUntilDue === null || daysUntilDue < 0) continue;

      // Check if within reminder window
      if (daysUntilDue > account.reminderDays) continue;

      // Check if already paid for this cycle
      const cycle = getCurrentCycle(account.type, account.createdAt);
      const payment = await getPaymentForCycle(account.id, cycle.year, cycle.month);

      if (payment?.paid) continue;

      // Send notification
      const { sent } = await sendPushToAll(subscriptions, {
        title: "Dues Reminder",
        body: `Your ${account.name} is due in ${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"}`,
        icon: "/icon.png",
      });

      notificationsSent += sent;
    }

    revalidatePath("/");

    return NextResponse.json({
      accountsChecked: activeAccounts.length,
      notificationsSent,
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
