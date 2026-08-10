"use server";

import type {
    SystemItem,
    UpdateSystemStatusInput,
} from "@/shared/lib/schemas/systems.schema";
import { updateSystemStatusSchema } from "@/shared/lib/schemas/systems.schema";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import {
    fetchSystemsService,
    updateSystemStatusService,
} from "@/shared/lib/supabase/services/admin/systems.service";
import { checkPlatformRoleService } from "@/shared/lib/supabase/services/platform-staff";

export interface SystemsActionResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

async function authorizeSystemsStaff() {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) throw new Error("auth.unauthorized");

    const role = await checkPlatformRoleService({ supabase, profileId: user.id });
    if (role !== "SUPER_ADMIN" && role !== "SUPPORT_AGENT") {
        throw new Error("auth.staffRequired");
    }

    // Authorization uses the caller's session; privileged data access happens
    // only after that check so platform staff are not dependent on end-user RLS.
    return createAdminClient();
}

export async function fetchSystemsAction(): Promise<
    SystemsActionResult<SystemItem[]>
> {
    try {
        const supabase = await authorizeSystemsStaff();
        const data = await fetchSystemsService(supabase);
        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "systems.fetchFailed",
        };
    }
}

export async function updateSystemStatusAction(
    input: UpdateSystemStatusInput,
): Promise<
    SystemsActionResult<{
        systemId: string;
        status: "ACTIVE" | "SUSPENDED" | "REJECTED";
        statusReason?: string;
    }>
> {
    const parsed = updateSystemStatusSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? "validation.invalidInput",
        };
    }

    try {
        const supabase = await authorizeSystemsStaff();
        const data = await updateSystemStatusService({ supabase, ...parsed.data });
        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "systems.updateFailed",
        };
    }
}
