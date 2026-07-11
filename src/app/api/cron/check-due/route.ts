import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createDb } from "@/db";
import { accounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendPushToAll } from "@/services/push";
import { getDaysUntilDue, getCurrentCycle } from "@/utils";
import { findPaymentForCycle } from "@/repositories/payments";
import * as pushSubscriptionsRepo from "@/repositories/push-subscriptions";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vercelCron = request.headers.get("x-vercel-cron");
  if (!cronSecret && !vercelCron) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = createDb();

    const activeAccounts = await db.select().from(accounts).where(eq(accounts.isActive, true));

    const dbSubscriptions = await pushSubscriptionsRepo.findAllSubscriptions();
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

      if (daysUntilDue === null || daysUntilDue < 0) continue;
      if (daysUntilDue > account.reminderDays) continue;

      const cycle = getCurrentCycle(account.type, account.createdAt);
      const payment = await findPaymentForCycle(account.id, cycle.year, cycle.month);

      if (payment?.paid) continue;

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
