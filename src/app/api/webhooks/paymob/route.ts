import { NextRequest, NextResponse } from "next/server";
import { processPaymentWebhookAction } from "@/shared/lib/actions/billing/process-payment-webhook.action";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const result = await processPaymentWebhookAction({
            orderId: body.orderId,
            transactionRef: body.transactionRef,
        });

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