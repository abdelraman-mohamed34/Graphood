import { z } from "zod";
import { status } from "./public/shared";

export const tenantSchema = z.object({
    id: z.string().uuid("Invalid Tenant ID"),
    system_id: z.string().uuid("Invalid System ID"),
    subscription_id: z
        .string()
        .uuid("Invalid Subscription Id")
        .nullable(),
    owner_id: z.string().uuid("Invalid Owner ID"),
    name: z
        .string()
        .min(3, "Tenant name must be at least 3 characters"),
    slug: z
        .string()
        .min(3)
        .regex(
            /^[a-z0-9-]+$/,
            "Slug can only contain lowercase letters, numbers and hyphens"
        ),
    subdomain: z
        .string()
        .min(3)
        .regex(
            /^[a-z0-9-]+$/,
            "Subdomain can only contain lowercase letters, numbers and hyphens"
        )
        .nullable()
        .optional(),
    status: z.enum(status).default("PENDING"),
    logo_url: z.preprocess(
        (value) => (value === "" ? null : value),
        z.string().url("Invalid logo URL").nullable().optional()
    ),
    primary_color: z
        .string()
        .regex(
            /^#([A-Fa-f0-9]{6})$/,
            "Invalid hex color"
        )
        .nullable()
        .optional(),
    email: z.string().email("Invalid email address"),
    phone: z
        .string()
        .min(10)
        .nullable()
        .optional(),
    country: z
        .string()
        .nullable()
        .optional(),
    city: z
        .string()
        .nullable()
        .optional(),
    address: z
        .string()
        .nullable()
        .optional(),
    timezone: z.string(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date().optional(),
});

export type Tenant = z.infer<typeof tenantSchema>;

export const updateTenantSchema = tenantSchema.pick({
    name: true,
    slug: true,
    email: true,
    phone: true,
    country: true,
    city: true,
    address: true,
    timezone: true,
    logo_url: true,
    primary_color: true,
});

export type UpdateTenant = z.infer<typeof updateTenantSchema>;