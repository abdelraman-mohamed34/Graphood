import { z } from "zod";
import { membershipRoles, status } from "./public/shared";
import { permissions } from "./public/permissions";

export { membershipRoles, status } from "./public/shared";

export const membershipSchema = z.object({
    id: z.string().uuid("Invalid Membership ID"),

    // profile
    profile_id: z.string().uuid("Invalid Profile ID"),

    // tenant
    tenant_id: z.string().uuid("Invalid Tenant ID"),

    // active tenant
    current_tenant_id: z.string().uuid("Invalid Active Tenant ID").nullable().optional(),

    role: z.enum(membershipRoles),

    permissions: z.array(z.enum(permissions)).nullable().default([]),

    status: z.enum(status).default("ACTIVE"),

    invited_by: z
        .string()
        .uuid("Invalid Profile ID")
        .nullable()
        .optional(),

    joined_at: z.coerce.date().nullable().optional(),

    created_at: z.coerce.date(),

    updated_at: z.coerce.date().nullable().optional(),

    // Relations
    profile: z
        .object({
            first_name: z.string(),
            last_name: z.string(),
        })
        .nullable()
        .optional(),

    inviter: z
        .object({
            first_name: z.string(),
            last_name: z.string(),
        })
        .nullable()
        .optional(),
});

export type Membership = z.infer<typeof membershipSchema>;