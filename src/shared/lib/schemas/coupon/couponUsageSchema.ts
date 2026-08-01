import { z } from "zod";

export const couponUsageSchema = z.object({
    id: z.string().uuid(),

    coupon_id: z.string().uuid(),

    order_id: z.string().uuid(),

    system_id: z.string().uuid(),

    profile_id: z.string().uuid(),

    used_at: z.coerce.date(),
});

export type CouponUsage = z.infer<
    typeof couponUsageSchema
>;