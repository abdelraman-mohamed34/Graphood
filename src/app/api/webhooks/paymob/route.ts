import { NextRequest, NextResponse } from "next/server";
import { confirmOrderPayment } from "@/shared/lib/supabase/services/billing";

export async function POST(req: NextRequest) {
    try {
        const secret = process.env.PAYMOB_WEBHOOK_SECRET;
        if (!secret || req.headers.get("x-webhook-secret") !== secret) {
            return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
        }

        const body = await req.json();
        if (typeof body.orderId !== "string" || typeof body.transactionRef !== "string") {
            return NextResponse.json({ success: false, error: "Invalid payload." }, { status: 400 });
        }

        const data = await confirmOrderPayment(body.orderId, body.transactionRef);
        const result = { success: true, data };

        return NextResponse.json(result);

    } catch (error) {
        console.error("Paymob webhook error:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Webhook processing failed.",
            },
            {
                status: 500,
            }
        );
    }
}
