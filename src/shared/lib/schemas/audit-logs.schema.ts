import { z } from "zod";

export const auditActionStatus = [
    "SYSTEM_CREATED",
    "SYSTEM_UPDATED",
    "SYSTEM_DELETED",
    "SYSTEM_STATUS_CHANGED",
    "STAFF_ADDED",
    "STAFF_REMOVED",
    "STAFF_ROLE_UPDATED",
    "INVITATION_SENT",
    "INVITATION_ACCEPTED",
] as const;

export const auditEntityTypes = [
    "system",
    "staff",
    "profile",
    "membership",
    "invitation",
    "tenant",
] as const;

export const auditLogSchema = z.object({
    id: z.string().uuid(),
    actor_id: z.string().uuid().nullable().optional(),
    tenant_id: z.string().uuid().nullable().optional(),
    action: z.union([
        z.enum(auditActionStatus),
        z.string(),
    ]),
    entity_type: z.union([
        z.enum(auditEntityTypes),
        z.string(),
    ]),
    entity_id: z.string().optional().nullable(),
    metadata: z.record(z.string(), z.any()).default({}),
    ip_address: z.string().optional().nullable(),
    created_at: z.coerce.date(),
});

export const createAuditLogSchema = auditLogSchema.omit({
    id: true,
    created_at: true,
});

// Server actions must derive attribution from the authenticated request.
export const createClientAuditLogSchema = createAuditLogSchema
    .omit({
        actor_id: true,
        tenant_id: true,
        ip_address: true,
    })
    .strict();

export type AuditLog = z.infer<typeof auditLogSchema>;
export type CreateAuditLogInput = z.infer<typeof createAuditLogSchema>;
export type CreateClientAuditLogInput = z.infer<typeof createClientAuditLogSchema>;
