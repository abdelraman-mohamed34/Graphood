"use server";

import { z } from "zod";

import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { getOrderById, provisionOrder } from "@/shared/lib/supabase/services/billing";
import { sendSystemEmail } from "@/shared/lib/email/send-system-email";

const redirectInputSchema = z.object({
    orderId: z.string().uuid(),
    paymentStatus: z.string().trim().min(1),
    merchantOrderId: z.string().trim().min(1).optional(),
    signature: z.string().trim().min(1).optional(),
});

export async function finalizeKashierRedirectAction(input: z.infer<typeof redirectInputSchema>) {
    const parsed = redirectInputSchema.safeParse(input);
    if (!parsed.success) return { success: false as const, error: "Invalid payment callback." };

    if (parsed.data.paymentStatus.toUpperCase() !== "SUCCESS") {
        return { success: true as const, processed: false as const };
    }

    const supabase = await createSupabaseServerClient();
    const user = await fetchUser(supabase);
    if (!user) return { success: false as const, error: "Unauthorized." };

    const order = await getOrderById({ orderId: parsed.data.orderId });
    if (!order || order.profile_id !== user.id) {
        return { success: false as const, error: "Order not found." };
    }

    if (parsed.data.merchantOrderId && parsed.data.merchantOrderId !== order.id) {
        return { success: false as const, error: "Payment callback order mismatch." };
    }

    // Query parameters are only a redirect signal. Payment authenticity and
    // the PAID transition must come from the signed server webhook.
    if (order.status !== "PAID") {
        return { success: true as const, processed: false as const };
    }

    const provisioned = await provisionOrder({ orderId: order.id });
    if (user.email) {
        void sendSystemEmail({
            to: user.email,
            event: "PURCHASE_SUCCESS",
            locale: parsed.data.paymentStatus.toLowerCase() === "success" ? "en" : "en",
            payload: {
                systemName: Array.isArray(order.systems) ? order.systems[0]?.name ?? "Graphood system" : order.systems?.name ?? "Graphood system",
                orderId: order.id,
                amount: `${order.amount} ${order.currency ?? "EGP"}`,
                workspaceUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/en/${order.tenant_slug ?? "workspaces"}/dashboard/quickview`,
            },
        }).catch((error) => console.error("Purchase confirmation email dispatch failed:", error));
    }
    return {
        success: true as const,
        processed: true as const,
        tenantId: provisioned.tenant.id,
    };
}
