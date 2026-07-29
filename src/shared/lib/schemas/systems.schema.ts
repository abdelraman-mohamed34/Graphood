import { z } from "zod";
import { status } from "./public/shared";

// systems.schema.ts
export const systemSchema = z.object({
    id: z.string().uuid("Invalid System ID"),

    // Identity
    name: z.string().min(3, "System name too short"),
    slug: z
        .string()
        .min(5, "Slug must be at least 5 characters")
        .regex(/^[a-z0-9-]+$/, "Invalid slug format"),

    description: z
        .string()
        .trim()
        .min(10, "Description must be at least 10 characters"),

    // Owner (creator of the system itself)
    owner_id: z.string().uuid("Invalid Owner ID"),

    // Pricing
    starter_price: z.number().min(0).default(0),
    pro_price: z.number().min(0).default(0),
    business_price: z.number().min(0).default(0),
    currency: z.string().default("EGP"),

    // System status
    status: z.enum(status).default("PENDING"),

    // Metadata
    category: z.string().trim().min(3),
    tags: z.array(z.string()).default([]),
    icon_url: z.string().url().optional(),
    is_public: z.boolean().default(true),

    created_at: z.coerce.date(),
    updated_at: z.coerce.date().optional(),
});

export type System = z.infer<typeof systemSchema>;

export const systemInsertSchema = systemSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
});

export type SystemInsert = z.infer<typeof systemInsertSchema>;

export const createSystemSchema = systemInsertSchema.omit({
    owner_id: true,
});

/**
 * React Hook Form should use the INPUT type.
 */
export type CreateSystemInput = z.input<typeof createSystemSchema>;

export const systemUpdateSchema = systemInsertSchema.partial();

export type SystemUpdate = z.infer<typeof systemUpdateSchema>;