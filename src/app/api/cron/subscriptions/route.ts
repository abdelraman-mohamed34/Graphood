import { NextRequest, NextResponse } from "next/server";
import { sendSystemEmail } from "@/shared/lib/email/send-system-email";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const dynamic = "force-dynamic";
const GRACE_MS = 3 * 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "Cron is not configured" }, { status: 500 });
  if (request.headers.get("authorization") !== "Bearer " + secret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const now = new Date();
  const { data, error } = await admin.from("subscriptions")
    .select("id, plan_name, end_date, status, last_expiry_warning_at, profiles(email)")
    .in("status", ["ACTIVE", "PAST_DUE"])
    .not("end_date", "is", null)
    .lte("end_date", new Date(now.getTime() + GRACE_MS).toISOString());
  if (error) {
    console.error("Subscription cron query error:", error);
    return NextResponse.json({ error: "Unable to query subscriptions" }, { status: 500 });
  }

  let warningsSent = 0, markedPastDue = 0, expired = 0;
  for (const subscription of data ?? []) {
    if (!subscription.end_date) continue;
    const end = new Date(subscription.end_date);
    const profile = Array.isArray(subscription.profiles) ? subscription.profiles[0] : subscription.profiles;
    if (subscription.status === "ACTIVE" && end > now && !subscription.last_expiry_warning_at && profile?.email) {
      const result = await sendSystemEmail({ to: profile.email, event: "SUBSCRIPTION_EXPIRING", payload: { planName: subscription.plan_name ?? "Subscription", expiresAt: subscription.end_date, billingUrl: new URL("/billing", request.url).toString() } });
      if (result.success) {
        const update = await admin.from("subscriptions").update({ last_expiry_warning_at: now.toISOString() }).eq("id", subscription.id).is("last_expiry_warning_at", null);
        if (!update.error) warningsSent++;
      }
      continue;
    }
    if (end < now && now.getTime() <= end.getTime() + GRACE_MS && subscription.status === "ACTIVE") {
      const update = await admin.from("subscriptions").update({ status: "PAST_DUE" }).eq("id", subscription.id).eq("status", "ACTIVE");
      if (!update.error) markedPastDue++;
      continue;
    }
    if (now.getTime() > end.getTime() + GRACE_MS) {
      const update = await admin.from("subscriptions").update({ status: "EXPIRED" }).eq("id", subscription.id).in("status", ["ACTIVE", "PAST_DUE"]);
      if (!update.error) {
        expired++;
        if (profile?.email) await sendSystemEmail({ to: profile.email, event: "SUBSCRIPTION_EXPIRING", payload: { planName: "Expired: " + (subscription.plan_name ?? "Subscription"), expiresAt: subscription.end_date, billingUrl: new URL("/billing", request.url).toString() } });
      }
    }
  }
  return NextResponse.json({ warningsSent, markedPastDue, expired });
}
