import { z } from "zod";
import { membershipRoles } from "../memberships.schema";
import { permissions } from "../public/permissions";

export const createInvitationSchema = z.object({
    email: z.string().trim().email().toLowerCase(),
    role: z.enum(membershipRoles),
    permissions: z.array(z.enum(permissions)).default([]),
    message: z.string().max(500).optional(),
});

export type CreateInvitationInput = z.input<typeof createInvitationSchema>;
export type CreateInvitation = z.output<typeof createInvitationSchema>;