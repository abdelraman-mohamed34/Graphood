import { NextRequest, NextResponse } from "next/server";
import { confirmOrderPayment } from "@/shared/lib/supabase/services/billing";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";

const webhookSchema = z.object({
    orderId: z.string().uuid(),
    transactionRef: z.string().trim().min(1).max(255),
}).strict();

function secretsMatch(received: string | null, expected: string): boolean {
    if (!received) return false;
    const receivedBuffer = Buffer.from(received);
    const expectedBuffer = Buffer.from(expected);
    return receivedBuffer.length === expectedBuffer.length &&
        timingSafeEqual(receivedBuffer, expectedBuffer);
}

export async function POST(req: NextRequest) {
    try {
        const secret = process.env.PAYMOB_WEBHOOK_SECRET;
        if (!secret || !secretsMatch(req.headers.get("x-webhook-secret"), secret)) {
            return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
        }

        const parsed = webhookSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json({ success: false, error: "Invalid payload." }, { status: 400 });
        }

        const data = await confirmOrderPayment(parsed.data.orderId, parsed.data.transactionRef);
        const result = { success: true, data };

        return NextResponse.json(result);

    } catch {

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
