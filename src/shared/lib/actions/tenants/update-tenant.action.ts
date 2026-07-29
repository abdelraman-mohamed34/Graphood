"use server";

import { getTenantBySlug } from "@/shared/lib/supabase/services/tenants/get-tenant-by-slug.service";
import { updateTenantService } from "@/shared/lib/supabase/services/tenants/update-tenant.service";
import { requireMembership } from "../../auth/requires/require-membership";
import { hasAnyPermission } from "../../auth/requires/require-permission";
import { requireUser } from "../../auth/requires/require-user";
import { UpdateTenant } from "../../schemas/tenants.schema";

type UpdateTenantActionProps = {
    tenantSlug: string;
    locale: string;
    data: UpdateTenant;
};

export async function updateTenantAction({
    tenantSlug,
    locale,
    data,
}: UpdateTenantActionProps) {
    try {
        const { user, supabase } = await requireUser(locale);

        const tenant = await getTenantBySlug(tenantSlug);

        if (!tenant) {
            return {
                success: false,
                message: "Tenant not found.",
            };
        }

        const membership = await requireMembership({
            supabase,
            tenantSlug,
            userId: user.id,
            redirectTo: `/${locale}/workspaces`,
        });

        const allowed = hasAnyPermission(membership, [
            "tenant.manage",
            "tenant.read",
        ]);

        if (!allowed) {
            return {
                success: false,
                message: "Unauthorized.",
            };
        }

        const updatedTenant = await updateTenantService({
            supabase,
            tenantId: tenant.id,
            data,
        });

        return {
            success: true,
            message: "Tenant updated successfully.",
            tenant: updatedTenant,
        };
    } catch (error) {
        console.error("UPDATE TENANT ACTION ERROR");
        console.error(error);

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to update tenant.",
        };
    }
}