import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { processKashierPayment, type KashierPaymentStatus } from "@/shared/lib/supabase/services/billing";

export const runtime = "nodejs";

const payloadSchema = z.object({
    merchantOrderId: z.string().uuid().optional(), orderId: z.string().uuid().optional(),
    transactionId: z.union([z.string(), z.number()]).optional(), transactionRef: z.union([z.string(), z.number()]).optional(),
    status: z.string().optional(), paymentStatus: z.string().optional(),
    amount: z.coerce.number().positive(), currency: z.string().trim().length(3),
}).passthrough();
const acceptedStatuses = new Set<KashierPaymentStatus>(["SUCCESS", "PAID", "COMPLETED", "FAILED", "CANCELED", "CANCELLED"]);

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
    const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest();
    const normalized = signature.trim().replace(/^sha256=/i, "");
    const received = /^[a-f\d]{64}$/i.test(normalized) ? Buffer.from(normalized, "hex") : Buffer.from(normalized, "base64");
    return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function POST(request: Request) {
    const secret = process.env.KASHIER_WEBHOOK_SECRET?.trim();
    if (!secret) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
    const signature = request.headers.get("x-kashier-signature") ?? request.headers.get("x-kashier-hmac-sha256");
    if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 401 });
    const rawBody = await request.text();
    if (!verifySignature(rawBody, signature, secret)) return NextResponse.json({ error: "Invalid signature." }, { status: 401 });

    let json: unknown;
    try { json = JSON.parse(rawBody); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
    const candidate = typeof json === "object" && json !== null && "data" in json
        ? (json as { data: unknown }).data
        : json;
    const parsed = payloadSchema.safeParse(candidate);
    if (!parsed.success) return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
    const payload = parsed.data;
    const orderId = payload.merchantOrderId ?? payload.orderId;
    const status = (payload.status ?? payload.paymentStatus ?? "").toUpperCase() as KashierPaymentStatus;
    const transactionRef = String(payload.transactionId ?? payload.transactionRef ?? "").trim();
    if (!orderId || !acceptedStatuses.has(status)) return NextResponse.json({ error: "Missing payment identifiers." }, { status: 400 });
    if (["SUCCESS", "PAID", "COMPLETED"].includes(status) && !transactionRef) {
        return NextResponse.json({ error: "Missing transaction reference." }, { status: 400 });
    }

    try {
        const data = await processKashierPayment({ orderId, transactionRef, amount: payload.amount, currency: payload.currency.toUpperCase(), status });
        return NextResponse.json({ received: true, data });
    } catch (error) {
        console.error("Kashier webhook processing failed", error);
        return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
    }
}
