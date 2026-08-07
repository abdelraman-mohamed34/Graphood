import { NextResponse } from "next/server";
import crypto from "crypto";

import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!data) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const secretKey = process.env.KASHIER_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const orderId = data.merchantOrderId || data.orderId;
    const isSuccess = data.status === "SUCCESS" || data.paymentStatus === "SUCCESS";

    if (isSuccess && orderId) {
      const supabase = await createSupabaseServerClient();

      await supabase
        .from("orders")
        .update({ status: "PAID", updated_at: new Date().toISOString() })
        .eq("id", orderId);

      await supabase
        .from("payments")
        .update({ status: "SUCCESS", updated_at: new Date().toISOString() })
        .eq("order_id", orderId);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("Kashier Webhook Error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}