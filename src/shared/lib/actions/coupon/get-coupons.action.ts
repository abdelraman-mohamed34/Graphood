"use server";

import { z } from "zod";

import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";
import { getSystemById } from "../../supabase/services/systems";
import { getCoupons } from "../../supabase/services/coupons";


const getCouponsSchema = z.object({
    systemId: z.string().uuid(),
});

type GetCouponsInput = z.infer<typeof getCouponsSchema>;

export async function getCouponsAction(
    input: GetCouponsInput
) {
    const parsed = getCouponsSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.flatten(),
        };
    }

    const supabase = await createSupabaseServerClient();

    const user = await fetchUser(supabase);

    if (!user) {
        return {
            success: false,
            error: "Unauthorized.",
        };
    }

    const system = await getSystemById(
        parsed.data.systemId,
        supabase
    );

    if (!system) {
        return {
            success: false,
            error: "System not found.",
        };
    }

    if (system.owner_id !== user.id) {
        return {
            success: false,
            error: "Unauthorized.",
        };
    }

    try {
        const coupons = await getCoupons({
            supabase,
            systemId: system.id,
        });

        return {
            success: true,
            data: coupons,
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch coupons.",
        };
    }
}