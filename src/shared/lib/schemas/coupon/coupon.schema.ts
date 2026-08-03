import { z } from "zod";

export const discountTypes = ["PERCENT", "FIXED"] as const;

export const couponSchema = z.object({
    id: z.string({ message: "ID is required" }).uuid("Invalid UUID format"),

    code: z
        .string({ message: "Coupon code is required" })
        .trim()
        .min(4, "Coupon code must be at least 4 characters")
        .max(50, "Coupon code cannot exceed 50 characters")
        .toUpperCase(),

    is_generated: z.boolean(),

    system_id: z
        .string({ message: "System ID is required" })
        .uuid("Invalid System ID format"),

    created_by: z
        .string({ message: "Creator ID is required" })
        .uuid("Invalid Creator ID format"),

    discount_type: z.enum(discountTypes, {
        message: "Please select a valid discount type",
    }),

    discount_value: z
        .number({ message: "Discount value must be a valid number" })
        .positive("Discount value must be greater than 0"),

    max_discount: z
        .number({ message: "Max discount must be a valid number" })
        .positive("Max discount must be greater than 0")
        .nullable(),

    license_type: z
        .enum(["SUBSCRIPTION", "RESELLER", "EXCLUSIVE"], {
            message: "Invalid license type",
        })
        .nullable(),

    plan: z
        .enum(["STARTER", "PRO", "BUSINESS"], {
            message: "Invalid plan",
        })
        .nullable(),

    min_order_amount: z
        .number({ message: "Minimum order amount must be a number" })
        .min(0, "Minimum order amount cannot be negative"),

    max_uses: z
        .number({ message: "Max uses must be a number" })
        .int("Max uses must be an integer")
        .positive("Max uses must be at least 1")
        .nullable(),

    max_uses_per_user: z
        .number({ message: "Max uses per user must be a number" })
        .int("Max uses per user must be an integer")
        .positive("Max uses per user must be at least 1"),

    used_count: z
        .number()
        .int("Used count must be an integer")
        .min(0, "Used count cannot be negative"),

    one_use_per_system: z.boolean(),

    starts_at: z.date().nullable(),
    expires_at: z.date().nullable(),
    
    is_active: z.boolean(),

    created_at: z.coerce.date(),

    updated_at: z.coerce.date(),
});

export type Coupon = z.infer<typeof couponSchema>;

export type DiscountType = (typeof discountTypes)[number];

const rawCreateCouponSchema = couponSchema.pick({
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

export const createCouponSchema = rawCreateCouponSchema
    .refine(
        (data) => {
            if (data.discount_type === "PERCENT") {
                return data.discount_value <= 100;
            }
            return true;
        },
        {
            message: "Percentage discount cannot exceed 100%",
            path: ["discount_value"],
        }
    )
    .refine(
        (data) => {
            if (data.starts_at && data.expires_at) {
                return data.expires_at > data.starts_at;
            }
            return true;
        },
        {
            message: "Expiration date must be after start date",
            path: ["expires_at"],
        }
    )
    .refine(
        (data) => {
            if (data.discount_type === "PERCENT") {
                return data.max_discount !== null && data.max_discount > 0;
            }
            return true;
        },
        {
            message: "Max discount is required for percentage discounts",
            path: ["max_discount"],
        }
    );

export type CreateCouponInput = z.infer<typeof createCouponSchema>;