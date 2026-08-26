import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { processKashierPayment, provisionOrder, type KashierPaymentStatus } from "@/shared/lib/supabase/services/billing";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import type { Json } from "@/shared/types/database.types";

export const runtime = "nodejs";

const payloadSchema = z.object({
    id: z.union([z.string(), z.number()]).optional(),
    eventId: z.union([z.string(), z.number()]).optional(),
    merchantOrderId: z.union([z.string(), z.number()]).optional(),
    orderId: z.union([z.string(), z.number()]).optional(),
    order: z.union([z.string(), z.number()]).optional(),
    sessionId: z.union([z.string(), z.number()]).optional(),
    transactionId: z.union([z.string(), z.number()]).optional(),
    transactionRef: z.union([z.string(), z.number()]).optional(),
    transactionReference: z.union([z.string(), z.number()]).optional(),
    reference: z.union([z.string(), z.number()]).optional(),
    status: z.string().optional(),
    paymentStatus: z.string().optional(),
    amount: z.coerce.number().positive().optional(),
    currency: z.string().trim().length(3).optional(),
    hash: z.string().optional(),
    metaData: z.record(z.string(), z.any()).optional(),
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
        payload.sessionId,
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
    const logMismatch = (receivedFormat: "hex" | "base64" | "unknown") => {
        if (process.env.NODE_ENV !== "production" || process.env.KASHIER_MODE === "test") {
            console.warn("Kashier webhook signature mismatch", {
                calculatedHex: expected.toString("hex"),
                calculatedBase64: expected.toString("base64"),
                received: normalized,
                receivedFormat,
            });
        }
    };

    let received: Buffer;
    const isHex = /^[a-f\d]{64}$/i.test(normalized);
    try {
        if (isHex) {
            received = Buffer.from(normalized, "hex");
        } else {
            if (!/^[a-z\d+/]+={0,2}$/i.test(normalized) || normalized.length % 4 !== 0) {
                logMismatch("unknown");
                return false;
            }
            received = Buffer.from(normalized, "base64");
        }
    } catch {
        logMismatch(isHex ? "hex" : "base64");
        return false;
    }

    const valid = received.length === expected.length && timingSafeEqual(received, expected);
    if (!valid) logMismatch(isHex ? "hex" : "base64");

    return valid;
}

async function verifyKashierSession(sessionId: string) {
    const mode = process.env.KASHIER_MODE?.trim().toLowerCase() || "test";
    const baseUrl = mode === "live"
        ? "https://api.kashier.io/v3/payment/sessions"
        : "https://test-api.kashier.io/v3/payment/sessions";
    const secretKey = process.env.KASHIER_SECRET_KEY?.trim();
    const apiKey = process.env.KASHIER_API_KEY?.trim();

    if (!secretKey || !apiKey) return null;

    try {
        const response = await fetch(`${baseUrl}/${encodeURIComponent(sessionId)}`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: secretKey,
                "api-key": apiKey,
            },
            cache: "no-store",
        });
        if (!response.ok) return null;
        const body = await response.json() as Record<string, unknown>;
        const data = typeof body.data === "object" && body.data !== null
            ? body.data as Record<string, unknown>
            : body;
        return {
            status: stringValue(data.status ?? data.paymentStatus),
            amount: typeof data.amount === "number" || typeof data.amount === "string" ? Number(data.amount) : undefined,
            currency: stringValue(data.currency)?.toUpperCase(),
            transactionRef: stringValue(data.transactionId ?? data.transactionRef ?? data.transactionReference),
        };
    } catch (error) {
        console.error("Kashier session verification failed:", error);
        return null;
    }
}

function getWebhookEventKey(payload: z.infer<typeof payloadSchema>, rawBody: string) {
    const gatewayEventId = payload.eventId ?? payload.id;
    const transactionRef = payload.transactionId ?? payload.transactionRef ?? payload.transactionReference ?? payload.reference;

    if (gatewayEventId != null && String(gatewayEventId).trim()) {
        return String(gatewayEventId).trim();
    }

    if (transactionRef != null && String(transactionRef).trim()) {
        return `transaction:${String(transactionRef).trim()}`;
    }

    return `payload:${createHash("sha256").update(rawBody, "utf8").digest("hex")}`;
}

async function recordWebhookEvent(input: {
    eventKey: string;
    orderId: string;
    transactionRef: string | null;
    status: KashierPaymentStatus;
    payload: Json;
}) {
    const { data, error } = await createAdminClient().rpc("record_payment_webhook_event", {
        p_provider: "KASHIER",
        p_event_key: input.eventKey,
        p_order_id: input.orderId,
        p_transaction_ref: input.transactionRef,
        p_status: input.status,
        p_payload: input.payload,
    });

    if (error) throw error;

    const event = z.object({
        event_id: z.string().uuid(),
        is_duplicate: z.boolean(),
        processed_at: z.string().nullable(),
    }).parse(data?.[0]);

    return {
        eventId: event.event_id,
        isDuplicate: event.is_duplicate,
        processedAt: event.processed_at,
    };
}

async function markWebhookEventFailed(eventId: string, error: unknown) {
    const message = error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null
            ? JSON.stringify(error)
            : String(error);
    const { error: markError } = await createAdminClient().rpc("mark_payment_webhook_event_failed", {
        p_event_id: eventId,
        p_error: message,
    });

    if (markError) {
        console.error(`Failed to persist Kashier webhook failure for event ${eventId}:`, markError);
    }
}

export async function POST(request: Request) {
    // Read the untouched request bytes before any JSON parsing. Kashier signs
    // this exact body representation.
    const rawBody = await request.text();

    const signatureSecrets = [
        process.env.KASHIER_API_KEY?.trim(),
        process.env.KASHIER_SECRET_KEY?.trim(),
    ].filter((value): value is string => Boolean(value));
    if (!signatureSecrets.length) {
        console.error("Kashier webhook signing key is not configured.");
        return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
    }

    let json: unknown;
    try {
        json = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    }

    const root = typeof json === "object" && json !== null ? json as Record<string, unknown> : {};
    const data = typeof root.data === "object" && root.data !== null ? root.data as Record<string, unknown> : {};
    const paymentParams = typeof root.paymentParams === "object" && root.paymentParams !== null
        ? root.paymentParams as Record<string, unknown>
        : {};
    const candidate = { ...root, ...data, ...paymentParams };
    const headerSignature = request.headers.get("x-kashier-signature") ?? request.headers.get("x-kashier-hmac-sha256");
    const bodySignature = stringValue(data.hash ?? paymentParams.hash ?? root.hash);
    const signature = headerSignature ?? bodySignature;
    const signatureValid = Boolean(
        signature && signatureSecrets.some((secret) => verifySignature(rawBody, signature, secret)),
    );

    const parsed = payloadSchema.safeParse(candidate);
    if (!parsed.success) {
        console.error("Invalid Kashier webhook payload:", parsed.error);
        return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
    }

    const payload = parsed.data;
    const orderId = await resolveInternalOrderId(payload);
    const sessionId = stringValue(payload.sessionId);
    let authorityVerification: Awaited<ReturnType<typeof verifyKashierSession>> = null;
    if (!signatureValid && orderId && sessionId) {
        authorityVerification = await verifyKashierSession(sessionId);
    }
    const status = (authorityVerification?.status ?? payload.status ?? payload.paymentStatus ?? "").toUpperCase() as KashierPaymentStatus;
    const transactionRef = authorityVerification?.transactionRef
        ?? stringValue(payload.transactionId ?? payload.transactionRef ?? payload.transactionReference ?? payload.reference)
        ?? "";
    const eventKey = getWebhookEventKey(payload, rawBody);

    if (!signatureValid && !authorityVerification) {
        console.error("Kashier webhook signature verification failed.");
        return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    }

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

    let webhookEventId: string | null = null;

    try {
        const webhookEvent = await recordWebhookEvent({
            eventKey,
            orderId,
            transactionRef: transactionRef || null,
            status,
            payload: json as Json,
        });

        webhookEventId = webhookEvent.eventId;

        if (webhookEvent.isDuplicate && webhookEvent.processedAt) {
            return new Response("OK", { status: 200 });
        }

        await processKashierPayment({
            orderId,
            transactionRef,
            amount: authorityVerification?.amount ?? payload.amount ?? 0,
            currency: (authorityVerification?.currency ?? payload.currency ?? "").toUpperCase(),
            status
        });

        if (isSuccess) {
            await provisionOrder({ orderId, webhookEventId });
        }

        if (!isSuccess) {
            const { error } = await createAdminClient().rpc("mark_payment_webhook_event_processed", {
                p_event_id: webhookEventId,
            });
            if (error) throw error;
        }

        return new Response("OK", { status: 200 });
    } catch (error) {
        console.error(`Kashier webhook processing failed for order ${orderId}:`, error);
        if (webhookEventId) {
            await markWebhookEventFailed(webhookEventId, error);
        }
        return NextResponse.json({
            error: "Webhook processing failed.",
            message: error instanceof Error
                ? error.message
                : typeof error === "object" && error !== null
                    ? JSON.stringify(error)
                    : String(error)
        }, { status: 500 });
    }
}
