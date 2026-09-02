// src/shared/lib/actions/billing/get-order.action.ts
"use server";

import { z } from "zod";
import { fetchUser } from "../../supabase/services/auth/user/fetch-user.service";
import { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "../../supabase/server";
import { getOrderById } from "../../supabase/services/billing";


const getOrderSchema = z.object({
    orderId: z.string().uuid("Invalid Order ID"),
});

type GetOrderInput = z.infer<typeof getOrderSchema>;

export async function getOrderAction(
    input: GetOrderInput
) {
    const parsed = getOrderSchema.safeParse(input);
    const supabase: SupabaseClient = await createSupabaseServerClient()

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.flatten(),
        };
    }

    const user = await fetchUser(supabase);

    if (!user) {
        return {
            success: false,
            error: "Unauthorized",
        };
    }

    const order = await getOrderById({
        orderId: parsed.data.orderId,
        supabase,
        profileId: user.id,
    });

    if (!order) {
        return {
            success: false,
            error: "Order not found.",
        };
    }

    return {
        success: true,
        data: order,
    };
}
