"use server";

import { z } from "zod";

import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";
import {
    cancelPendingOrder,
    getPendingUserSystemOrder,
} from "@/shared/lib/supabase/services/billing";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

const uuidSchema = z.string().uuid();

export async function getPendingOrderAction(systemId: string) {
    const parsedSystemId = uuidSchema.safeParse(systemId);
    if (!parsedSystemId.success) return null;

    const supabase = await createSupabaseServerClient();
    const user = await fetchUser(supabase);
    if (!user) return null;

    return getPendingUserSystemOrder(user.id, parsedSystemId.data, supabase);
}

export async function cancelOrderAction(orderId: string) {
    const parsedOrderId = uuidSchema.safeParse(orderId);
    if (!parsedOrderId.success) return { success: false as const, error: "INVALID_ORDER" };

    try {
        const sessionClient = await createSupabaseServerClient();
        const user = await fetchUser(sessionClient);
        if (!user) return { success: false as const, error: "UNAUTHORIZED" };

        // Authentication is established with the session client. The service
        // client bypasses RLS, while profileId keeps the mutation scoped to
        // the authenticated owner and the service also requires PENDING.
        const canceledOrder = await cancelPendingOrder(createAdminClient(), {
            orderId: parsedOrderId.data,
            profileId: user.id,
        });

        if (!canceledOrder) {
            return { success: false as const, error: "ORDER_NOT_PENDING" };
        }

        return { success: true as const };
    } catch (error) {
        console.error("Cancel pending order failed:", error);
        return { success: false as const, error: "CANCEL_FAILED" };
    }
}
