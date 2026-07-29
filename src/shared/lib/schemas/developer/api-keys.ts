import { z } from "zod";

export const DeveloperApiKeySchema = z.object({
    id: z.string().uuid(),

    system_id: z.string().uuid(),

    key_hash: z.string().min(1),
    encrypted_key: z.string().min(1),
    name: z.string().min(1),

    is_active: z.boolean(),

    last_used_at: z.coerce.date().nullable(),

    expires_at: z.coerce.date().nullable(),

    created_at: z.coerce.date(),

    updated_at: z.coerce.date(),
});

export const DeveloperApiKeyInsertSchema = DeveloperApiKeySchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    last_used_at: true,
    key_hash: true,
    encrypted_key: true,
});

export const DeveloperApiKeyUpdateSchema =
    DeveloperApiKeyInsertSchema.partial();

export type DeveloperApiKey = z.infer<typeof DeveloperApiKeySchema>;
export type DeveloperApiKeyInsert = z.infer<typeof DeveloperApiKeyInsertSchema>;
export type DeveloperApiKeyUpdate = z.infer<typeof DeveloperApiKeyUpdateSchema>;