import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/shared/lib/supabase/admin";
import { sendSystemEmail } from "@/shared/lib/email/send-system-email";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!secret) {
    console.error("Subscription cron is not configured: CRON_SECRET is missing");
    return NextResponse.json({ error: "Cron is not configured" }, { status: 500 });
  }

  if (authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();
  const warningLimit = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const { data: expiring, error: expiringError } = await admin
    .from("subscriptions")
    .select("id, plan_name, end_date, profile_id")
    .eq("status", "ACTIVE")
    .not("end_date", "is", null)
    .gt("end_date", now.toISOString())
    .lte("end_date", warningLimit.toISOString());

  if (expiringError) {
    console.error("Subscription warning query error:", expiringError);
    return NextResponse.json({ error: "Unable to query subscriptions" }, { status: 500 });
  }

  let warningsSent = 0;
  for (const subscription of expiring ?? []) {
    try {
      if (!subscription.profile_id) continue;
      const { data: profile } = await admin.from("profiles").select("email").eq("id", subscription.profile_id).maybeSingle();
      if (!profile?.email || !subscription.end_date) continue;
      await sendSystemEmail({
        to: profile.email,
        event: "SUBSCRIPTION_EXPIRING",
        payload: { planName: subscription.plan_name ?? "Subscription", expiresAt: subscription.end_date, billingUrl: "/billing" },
      });
      warningsSent += 1;
    } catch (error) {
      console.error("Subscription warning email error:", error);
    }
  }

  const { data: expired, error: expiredError } = await admin
    .from("subscriptions")
    .select("id, plan_name, end_date, profile_id")
    .eq("status", "ACTIVE")
    .not("end_date", "is", null)
    .lte("end_date", now.toISOString());

  if (expiredError) {
    console.error("Subscription expiration query error:", expiredError);
    return NextResponse.json({ warningsSent, error: "Unable to expire subscriptions" }, { status: 500 });
  }

  let expiredCount = 0;
  for (const subscription of expired ?? []) {
    const { error: updateError } = await admin
      .from("subscriptions")
      .update({ status: "EXPIRED" })
      .eq("id", subscription.id)
      .eq("status", "ACTIVE");
    if (updateError) {
      console.error("Subscription expiration update error:", updateError);
      continue;
    }
    expiredCount += 1;
    try {
      if (!subscription.profile_id) continue;
      const { data: profile } = await admin.from("profiles").select("email").eq("id", subscription.profile_id).maybeSingle();
      if (profile?.email) {
        await sendSystemEmail({
          to: profile.email,
          event: "SUBSCRIPTION_EXPIRING",
          payload: { planName: `Expired: ${subscription.plan_name ?? "Subscription"}`, expiresAt: subscription.end_date ?? now.toISOString(), billingUrl: "/billing" },
        });
      }
    } catch (error) {
      console.error("Subscription expiration email error:", error);
    }
  }

  return NextResponse.json({ warningsSent, expired: expiredCount });
}
