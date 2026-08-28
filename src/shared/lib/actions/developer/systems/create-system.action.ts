"use server";

import {
    CreateSystemInput,
    createSystemSchema,
} from "@/shared/lib/schemas/systems.schema";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";
import { createApiKey } from "@/shared/lib/supabase/services/developer/api-keys";
import { createSystem } from "@/shared/lib/supabase/services/systems";
import { sanitizeMarkdownSource } from "@/shared/lib/markdown";
import { sendSystemEmail } from "@/shared/lib/email/send-system-email";

export async function createSystemAction(
    data: CreateSystemInput
) {
    const supabase = await createSupabaseServerClient();

    const user = await fetchUser(supabase);

    if (!user) {
        throw new Error("Authentication required.");
    }

    const payload = createSystemSchema.parse(data);
    payload.readme = payload.readme ? sanitizeMarkdownSource(payload.readme) : "";

    const system = await createSystem(payload, user.id);

    const apiKey = await createApiKey({
        system_id: system.id,
        name: "Default API Key",
        is_active: true,
        expires_at: null,
    });

    if (user.email) {
        void sendSystemEmail({
            to: user.email,
            event: "SYSTEM_PUBLISHED",
            payload: { systemName: system.name, dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/en/dashboard`, supportUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/en/contact` },
        }).catch((error) => console.error("System submission email dispatch failed:", error));
    }

    return {
        system: { id: system.id },
        apiKey: apiKey.apiKey,
    };
}
