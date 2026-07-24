import { z } from "zod";

export const couponSchema = z.object({
    id: z.string().uuid(),

    code: z
        .string()
        .min(6, "Coupon code must be at least 6 characters")
        .max(50),

    system_id: z.string().uuid(),

    created_by: z.string().uuid(),

    percentage: z
        .number()
        .min(1, "Minimum discount is 1%")
        .max(100, "Maximum discount is 100%"),

    max_uses: z
        .number()
        .int()
        .positive()
        .default(1),

    used_count: z
        .number()
        .int()
        .min(0)
        .default(0),

    is_active: z.boolean().default(true),

    expires_at: z.coerce.date().optional(),

    created_at: z.coerce.date(),

    updated_at: z.coerce.date().optional(),
});

export type Coupon = z.infer<typeof couponSchema>;