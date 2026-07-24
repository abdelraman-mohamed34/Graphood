import { z } from "zod";
import { status } from "./public/shared";

export const tenantSchema = z.object({
    id: z.string().uuid("Invalid Tenant ID"),

    // MUST belong to system (hard rule)
    system_id: z.string().uuid("Invalid System ID"),
    subscription_id: z.string().uuid("Invalid Subscription Id "),

    // Primary Owner (profile who created tenant)
    owner_id: z.string().uuid("Invalid Owner ID"),

    // Identity (scoped داخل system)
    name: z.string().min(3, "Tenant name must be at least 3 characters"),

    slug: z
        .string()
        .min(3)
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens"),

    subdomain: z
        .string()
        .min(3)
        .regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers and hyphens")
        .optional(),

    // Status
    status: z.enum(status).default("PENDING"),

    // Branding
    logo_url: z.string().url("Invalid logo URL").nullable().optional(),

    primary_color: z
        .string()
        .regex(/^#([A-Fa-f0-9]{6})$/, "Invalid hex color")
        .optional(),

    // Contact
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10).optional(),

    // Location
    country: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),

    timezone: z.string().default("Africa/Cairo"),

    // Metadata
    created_at: z.coerce.date(),
    updated_at: z.coerce.date().optional(),
});

export type Tenant = z.infer<typeof tenantSchema>