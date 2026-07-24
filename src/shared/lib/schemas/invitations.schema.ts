import z from "zod";
import { membershipRoles } from "./memberships.schema";
import { permissions } from "./public/permissions";

export const invitationStatus = [
    "PENDING",
    "ACCEPTED",
    "REJECTED",
    "EXPIRED",
    "CANCELLED",
] as const;

export const invitationSchema = z.object({
    id: z.string().uuid(),
    email: z.string().trim().email().toLowerCase(),
    tenant_id: z.string().uuid(),
    role: z.enum(membershipRoles),
    permissions: z.array(z.enum(permissions)).default([]),
    created_by: z.string().uuid(),
    status: z.enum(invitationStatus).default("PENDING"),
    token: z.string().min(32),
    message: z.string().max(500).optional(),
    expires_at: z.coerce.date(),
    accepted_at: z.coerce.date().optional(),
    accepted_by: z.string().uuid().optional(),
    cancelled_at: z.coerce.date().optional(),
    cancelled_by: z.string().uuid().optional(),
    resent_count: z.number().int().nonnegative().default(0),
    last_sent_at: z.coerce.date().optional(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date().optional(),
});

export type Invitation = z.infer<typeof invitationSchema>;