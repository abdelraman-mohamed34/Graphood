import { z } from "zod";

export const discountTypes = [
    "PERCENTAGE",
    "FIXED",
] as const;

export const couponSchema = z.object({
    id: z.string().uuid(),

    code: z
        .string()
        .trim()
        .min(4)
        .max(50)
        .toUpperCase(),

    is_generated: z.boolean(),

    system_id: z.string().uuid(),

    created_by: z.string().uuid(),

    discount_type: z.enum(discountTypes),

    discount_value: z.number().positive(),

    max_discount: z.number().positive().nullable(),

    license_type: z
        .enum([
            "SUBSCRIPTION",
            "RESELLER",
            "EXCLUSIVE",
        ])
        .nullable(),

    plan: z
        .enum([
            "STARTER",
            "PRO",
            "BUSINESS",
        ])
        .nullable(),

    min_order_amount: z.number().min(0),

    max_uses: z
        .number()
        .int()
        .positive()
        .nullable(),

    max_uses_per_user: z
        .number()
        .int()
        .positive(),

    used_count: z
        .number()
        .int()
        .min(0),

    one_use_per_system: z.boolean(),

    starts_at: z.coerce.date().nullable(),

    expires_at: z.coerce.date().nullable(),

    is_active: z.boolean(),

    created_at: z.coerce.date(),

    updated_at: z.coerce.date(),
});

export type Coupon = z.infer<typeof couponSchema>;

export type DiscountType =
    (typeof discountTypes)[number];

export const createCouponSchema = couponSchema.pick({
    code: true,
    system_id: true,
    discount_type: true,
    discount_value: true,
    max_discount: true,
    license_type: true,
    plan: true,
    min_order_amount: true,
    max_uses: true,
    max_uses_per_user: true,
    one_use_per_system: true,
    starts_at: true,
    expires_at: true,
    is_active: true,
});

export type CreateCouponInput = z.infer<
    typeof createCouponSchema
>;