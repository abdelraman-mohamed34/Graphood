import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { processKashierPayment, provisionOrder, type KashierPaymentStatus } from "@/shared/lib/supabase/services/billing";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const runtime = "nodejs";

const payloadSchema = z.object({
    merchantOrderId: z.union([z.string(), z.number()]).optional(),
    orderId: z.union([z.string(), z.number()]).optional(),
    order: z.union([z.string(), z.number()]).optional(),
    sessionId: z.union([z.string(), z.number()]).optional(),
    transactionId: z.union([z.string(), z.number()]).optional(),
    transactionRef: z.union([z.string(), z.number()]).optional(),
    status: z.string().optional(),
    paymentStatus: z.string().optional(),
    amount: z.coerce.number().positive(),
    currency: z.string().trim().length(3),
    metaData: z.record(z.any()).optional(),
}).passthrough();

const acceptedStatuses = new Set<KashierPaymentStatus>(["SUCCESS", "PAID", "COMPLETED", "FAILED", "CANCELED", "CANCELLED"]);
const uuidSchema = z.string().uuid();

function stringValue(value: unknown) {
    const result = typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
    return result && result !== "NA" ? result : null;
}

async function resolveInternalOrderId(payload: z.infer<typeof payloadSchema>) {
    const metadata = payload.metaData;
    const candidates = [
        payload.merchantOrderId,
        payload.orderId,
        payload.order,
        metadata && typeof metadata.orderId === "string" ? metadata.orderId : undefined,
    ].map(stringValue).filter((value): value is string => Boolean(value));

    const admin = createAdminClient();
    for (const candidate of candidates) {
        if (uuidSchema.safeParse(candidate).success) {
            const { data, error } = await admin.from("orders").select("id").eq("id", candidate).maybeSingle();
            if (error) throw error;
            if (data?.id) return data.id;
        }

        const { data, error } = await admin
            .from("payments")
            .select("order_id")
            .eq("provider", "KASHIER")
            .eq("provider_reference", candidate)
            .maybeSingle();
        if (error) throw error;
        if (data?.order_id) return data.order_id;
    }

    return null;
}

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
    const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest();
    const normalized = signature.trim().replace(/^sha256=/i, "");
    
    let received: Buffer;
    try {
        received = /^[a-f\d]{64}$/i.test(normalized) 
            ? Buffer.from(normalized, "hex") 
            : Buffer.from(normalized, "base64");
    } catch {
        return false;
    }

    return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function POST(request: Request) {
    const secret = process.env.KASHIER_WEBHOOK_SECRET?.trim();
    if (!secret) {
        console.error("Kashier webhook secret is not configured.");
        return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
    }

    const signature = request.headers.get("x-kashier-signature") ?? request.headers.get("x-kashier-hmac-sha256");
    if (!signature) {
        return NextResponse.json({ error: "Missing signature." }, { status: 401 });
    }

    const rawBody = await request.text();
    if (!verifySignature(rawBody, signature, secret)) {
        console.error("Kashier webhook signature verification failed.");
        return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    }

    let json: unknown;
    try {
        json = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    }

    const candidate = typeof json === "object" && json !== null && "data" in json
        ? (json as { data: unknown }).data
        : json;

    const parsed = payloadSchema.safeParse(candidate);
    if (!parsed.success) {
        console.error("Invalid Kashier webhook payload:", parsed.error);
        return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
    }

    const payload = parsed.data;
    const orderId = await resolveInternalOrderId(payload);
    const status = (payload.status ?? payload.paymentStatus ?? "").toUpperCase() as KashierPaymentStatus;
    const transactionRef = String(payload.transactionId ?? payload.transactionRef ?? "").trim();

    if (!orderId || !acceptedStatuses.has(status)) {
        console.error("Kashier webhook order could not be matched to an internal order.", {
            merchantOrderId: payload.merchantOrderId,
            orderId: payload.orderId,
            order: payload.order,
            sessionId: payload.sessionId,
        });
        return NextResponse.json({ error: "Missing payment identifiers." }, { status: 400 });
    }

    const isSuccess = ["SUCCESS", "PAID", "COMPLETED"].includes(status);

    if (isSuccess && !transactionRef) {
        return NextResponse.json({ error: "Missing transaction reference." }, { status: 400 });
    }

    try {
        // 1. Update order/payment status in Supabase
        const data = await processKashierPayment({
            orderId,
            transactionRef,
            amount: payload.amount,
            currency: payload.currency.toUpperCase(),
            status
        });

        // 2. If payment was successful, trigger provisioning (tenant, subscription, membership)
        if (isSuccess) {
            console.log(`Triggering provisioning for order ${orderId}...`);
            await provisionOrder({ orderId });
        }

        return NextResponse.json({ received: true, orderId, status });
    } catch (error) {
        console.error(`Kashier webhook processing failed for order ${orderId}:`, error);
        return NextResponse.json({ 
            error: "Webhook processing failed.",
            message: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
