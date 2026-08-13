'use server'

import { getSystemById, submitPendingReadme, updateSystem } from "@/shared/lib/supabase/services/systems";
import { SystemUpdate, systemUpdateSchema } from "@/shared/lib/schemas/systems.schema";
import { z } from "zod";
import { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";
import { sanitizeMarkdownSource } from "@/shared/lib/markdown";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { createAuditLog } from "@/shared/lib/supabase/services/audit-logs";

export async function updateSystemAction(
    id: string,
    data: SystemUpdate,
) {
    const systemId = z.string().uuid().parse(id);
    const payload = systemUpdateSchema.parse(data);
    // Publication status is controlled exclusively by platform staff.
    delete payload.status;
    if (payload.readme !== undefined) payload.readme = sanitizeMarkdownSource(payload.readme);
    const supabase: SupabaseClient = await createSupabaseServerClient();
    const user = await fetchUser(supabase);

    if (!user) {
        throw new Error("system error: required user");
    }

    const existingSystem = await getSystemById(systemId, supabase);

    if (!existingSystem) {
        throw new Error("system error: System not found");
    }

    if (existingSystem.owner_id !== user.id) {
        throw new Error("system error: You don't have permissions to do this action");
    }

    const isActive = existingSystem.status === "ACTIVE";
    const submittedReadme = payload.readme;

    if (isActive && submittedReadme !== undefined) {
        await submitPendingReadme(systemId, submittedReadme, user.id);
        delete payload.readme;
    }

    await updateSystem(systemId, payload);

    const developerName = [
        user.user_metadata?.first_name,
        user.user_metadata?.last_name,
    ].filter(Boolean).join(" ") || user.user_metadata?.full_name || user.id;

    const notification = await createAuditLog(createAdminClient(), {
        actor_id: user.id,
        action: "SYSTEM_PROFILE_UPDATE_SUBMITTED",
        entity_type: "system",
        entity_id: systemId,
        tenant_id: null,
        metadata: {
            system_name: existingSystem.name,
            developer_id: user.id,
            developer_name: developerName,
            review_url: `/admin/systems/${systemId}/review`,
            includes_readme: submittedReadme !== undefined,
            readme_pending_approval: isActive && submittedReadme !== undefined,
        },
    });
    if (!notification) throw new Error("system error: Admin notification could not be created");

    return { success: true as const, pendingReview: isActive && submittedReadme !== undefined };
}
