import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createHmac, timingSafeEqual } from "node:crypto";

import {
    confirmOrderPayment,
    failOrderPayment,
} from "@/shared/lib/supabase/services/billing";
import { createAdminClient } from "@/shared/lib/supabase/admin";

const paymobWebhookSchema = z.object({
    obj: z.object({
        amount_cents: z.number().int().nonnegative(),
        created_at: z.string().min(1),
        currency: z.string().min(1),
        error_occured: z.boolean(),
        has_parent_transaction: z.boolean(),
        id: z.number().int().positive(),
        integration_id: z.number().int().positive(),
        is_3d_secure: z.boolean(),
        is_auth: z.boolean(),
        is_capture: z.boolean(),
        is_refunded: z.boolean(),
        is_standalone_payment: z.boolean(),
        order: z.object({
            id: z.number().int().positive(),
            merchant_order_id: z.string().uuid().optional(),
        }),
        owner: z.number().int(),
        pending: z.boolean(),
        source_data: z.object({
            pan: z.string().nullable().optional(),
            sub_type: z.string().nullable().optional(),
            type: z.string().nullable().optional(),
        }),
        success: z.boolean(),
    }),
});

type PaymobWebhook = z.infer<typeof paymobWebhookSchema>;

function canonicalHmacValues(obj: PaymobWebhook["obj"]): string {
    // This order is Paymob's documented HMAC order. Every value is already
    // validated, so no undefined/null JavaScript coercion is possible here.
    return [
        String(obj.amount_cents),
        obj.created_at,
        obj.currency,
        String(obj.error_occured),
        String(obj.has_parent_transaction),
        String(obj.id),
        String(obj.integration_id),
        String(obj.is_3d_secure),
        String(obj.is_auth),
        String(obj.is_capture),
        String(obj.is_refunded),
        String(obj.is_standalone_payment),
        String(obj.order.id),
        String(obj.owner),
        String(obj.pending),
        obj.source_data.pan ?? "",
        obj.source_data.sub_type ?? "",
        obj.source_data.type ?? "",
        String(obj.success),
    ].join("");
}

function verifyPaymobHmac(
    payload: PaymobWebhook,
    receivedHmac: string,
    secret: string,
): boolean {
    const calculated = createHmac("sha512", secret)
        .update(canonicalHmacValues(payload.obj), "utf8")
        .digest();
    const received = Buffer.from(receivedHmac, "hex");

    return (
        received.length === calculated.length &&
        timingSafeEqual(calculated, received)
    );
}

export async function POST(req: NextRequest) {
    try {
        const secret = process.env.PAYMOB_HMAC_SECRET;
        const receivedHmac = req.nextUrl.searchParams.get("hmac");
        if (!secret || !receivedHmac || !/^[a-f\d]{128}$/i.test(receivedHmac)) {
            return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
        }

        const parsed = paymobWebhookSchema.safeParse(await req.json());
        if (!parsed.success || !verifyPaymobHmac(parsed.data, receivedHmac, secret)) {
            return NextResponse.json({ success: false, error: "Invalid webhook." }, { status: 401 });
        }

        const { obj } = parsed.data;
        const supabase = createAdminClient();
        const { data: payment, error: paymentError } = await supabase
            .from("payments")
            .select("id, order_id, provider, provider_reference, provider_integration_id, status, amount, currency, orders(id, amount, currency, status)")
            .eq("provider_reference", String(obj.order.id))
            .eq("provider", "PAYMOB")
            .maybeSingle();

        if (paymentError) throw paymentError;
        if (!payment || !payment.orders) {
            return NextResponse.json({ success: false, error: "Payment not found." }, { status: 404 });
        }

        const order = Array.isArray(payment.orders) ? payment.orders[0] : payment.orders;
        if (
            !order ||
            payment.provider_integration_id !== obj.integration_id ||
            payment.currency !== "EGP" ||
            order.currency !== "EGP" ||
            obj.amount_cents !== Math.round(Number(order.amount) * 100)
        ) {
            return NextResponse.json({ success: false, error: "Payment mismatch." }, { status: 400 });
        }

        if (!obj.success || obj.pending) {
            if (!obj.pending && !obj.success) {
                await failOrderPayment({
                    paymobOrderId: obj.order.id,
                    amountCents: obj.amount_cents,
                    currency: "EGP",
                });
            }
            return NextResponse.json({ success: true, ignored: true }, { status: 200 });
        }

        const data = await confirmOrderPayment({
            paymobOrderId: obj.order.id,
            transactionRef: String(obj.id),
            amountCents: obj.amount_cents,
            currency: "EGP",
        });

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        console.error("Paymob webhook processing failed", error);
        return NextResponse.json({ success: false, error: "Webhook processing failed." }, { status: 500 });
    }
}
