import { z } from "zod";
import { status } from "./public/shared";
import type { Tables } from "@/shared/types/database.types";
import { hasUnsafeMarkdown, SYSTEM_DESCRIPTION_MAX_LENGTH, SYSTEM_README_MAX_LENGTH } from "@/shared/lib/markdown";

// systems.schema.ts
export const systemSchema = z.object({
    id: z.string().uuid("Invalid System ID"),

    // Identity
    name: z.string().min(3, "System name too short"),

    slug: z
        .string()
        .min(5, "Slug must be at least 5 characters"),
        // .regex(
        //     /^[a-z0-9.-]+$/,
        //     "Invalid slug format"
        // ),

    description: z
        .string()
        .trim()
        .min(10, "Description must be at least 10 characters")
        .max(SYSTEM_DESCRIPTION_MAX_LENGTH, "Description must not exceed 250 characters"),

    readme: z.string().max(SYSTEM_README_MAX_LENGTH, "README must not exceed 30,000 characters")
        .refine((value) => !hasUnsafeMarkdown(value), "README contains unsafe HTML or a prohibited URL protocol")
        .optional()
        .default(""),

    // Owner (creator of the system itself)
    owner_id: z.string().uuid("Invalid Owner ID"),

    // Pricing
    starter_price: z.number().min(0).default(0),
    pro_price: z.number().min(0).default(0),
    business_price: z.number().min(0).default(0),

    // License Pricing
    reseller_price: z.number().min(0).default(0),
    exclusive_price: z.number().min(0).default(0),

    currency: z.string().default("EGP"),
    // System status
    status: z.enum(status).default("PENDING"),

    // Metadata
    tags: z
        .array(z.string().uuid("Invalid Tag ID"))
        .min(1, "Select at least one tag/category"),
    icon_url: z.string().url().optional(),
    image_url: z.string().url().optional().or(z.literal("")),
    base_launch_url: z.string().trim().url("System base URL must be a valid URL").or(z.literal("")).default(""),
    launch_type: z.enum(["QUERY_PARAM", "SUBDOMAIN"]).default("QUERY_PARAM"),
    is_public: z.boolean().default(true),

    created_at: z.coerce.date(),
    updated_at: z.coerce.date().optional(),
});

export type System = Tables<"systems">;

export const systemInsertSchema = systemSchema.omit({
    id: true,
    slug: true,
    created_at: true,
    updated_at: true,
});

export type SystemInsert = z.infer<typeof systemInsertSchema>;

export const getCreateSystemSchema = (t?: (key: string) => string) =>
    systemInsertSchema.omit({ owner_id: true }).extend({
        name: z.string().min(3, t ? t("validation.nameMin") : "System name too short"),
        description: z
            .string()
            .trim()
            .min(10, t ? t("validation.descriptionMin") : "Description must be at least 10 characters")
            .max(SYSTEM_DESCRIPTION_MAX_LENGTH, t ? t("validation.descriptionMax") : "Description must not exceed 250 characters"),
        tags: z
            .array(z.string().uuid(t ? t("validation.invalidTag") : "Invalid Tag ID"))
            .min(1, t ? t("validation.tagsRequired") : "Select at least one tag/category"),
    });

export const createSystemSchema = getCreateSystemSchema();

/**
 * React Hook Form should use the INPUT type.
 */
export type CreateSystemInput = z.input<ReturnType<typeof getCreateSystemSchema>>;

export const systemUpdateSchema = systemInsertSchema.partial();

export type SystemUpdate = z.infer<typeof systemUpdateSchema>;

export const adminSystemStatusSchema = z.enum([
    "ACTIVE",
    "SUSPENDED",
    "REJECTED",
]);

export const updateSystemStatusSchema = z.object({
    systemId: z.uuid({ error: "validation.systemIdInvalid" }),
    status: adminSystemStatusSchema,
    reason: z
        .string()
        .trim()
        .max(500, { error: "validation.reasonTooLong" })
        .optional()
        .transform((reason) => reason || undefined),
});

export type UpdateSystemStatusInput = z.input<typeof updateSystemStatusSchema>;
export type SystemItemStatus =
    | "PENDING"
    | "ACTIVE"
    | "SUSPENDED"
    | "REJECTED"
    | "ARCHIVED";

export interface SystemItem {
    id: string;
    name: string;
    slug: string;
    ownerId: string;
    ownerEmail: string | null;
    ownerName: string;
    status: SystemItemStatus;
    statusReason: string | null;
    createdAt: string | null;
    hasPendingReadme: boolean;
}
