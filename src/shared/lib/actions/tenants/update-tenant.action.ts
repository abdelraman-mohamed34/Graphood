"use server";

import { getTenantBySlug } from "@/shared/lib/supabase/services/tenants/get-tenant-by-slug.service";
import { updateTenantService } from "@/shared/lib/supabase/services/tenants/update-tenant.service";

import { requireMembership } from "../../auth/requires/require-membership";
import { hasPermission } from "../../auth/requires/require-permission";
import { requireUser } from "../../auth/requires/require-user";

import {
    UpdateTenant,
    updateTenantSchema,
} from "../../schemas/tenants.schema";
import { z } from "zod";
import { createAdminClient } from "@/shared/lib/supabase/admin";

const tenantContextSchema = z
    .object({
        tenantSlug: z.string().trim().toLowerCase().min(1).max(100),
        locale: z.enum(["ar", "en"]),
    })
    .strict();

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
        const context = tenantContextSchema.parse({ tenantSlug, locale });
        const parsed = updateTenantSchema.safeParse(data);

        if (!parsed.success) {
            console.error("Workspace update validation error:", parsed.error.flatten());

            return {
                success: false,
                message: parsed.error.issues[0]?.message ?? "Invalid workspace settings.",
                errors: parsed.error.flatten(),
            };
        }

        const { user, supabase } = await requireUser(context.locale);

        const tenant = await getTenantBySlug(supabase, context.tenantSlug);

        if (!tenant) {
            return {
                success: false,
                message: "Tenant not found.",
            };
        }

        const membership = await requireMembership({
            supabase,
            tenantSlug: context.tenantSlug,
            userId: user.id,
            redirectTo: `/${locale}/workspaces`,
        });

        const allowed = hasPermission(
            membership,
            "tenant.manage"
        );

        if (!allowed) {
            return {
                success: false,
                message: "Unauthorized.",
            };
        }

        if (tenant.id !== membership.tenant_id) {
            console.error("Workspace update tenant scope mismatch:", {
                tenantId: tenant.id,
                membershipTenantId: membership.tenant_id,
            });

            return {
                success: false,
                message: "Unauthorized.",
            };
        }

        const updatedTenant = await updateTenantService({
            // Membership and permission checks above authorize this change;
            // perform the final write with the service client to avoid RLS
            // blocking an otherwise authorized workspace update.
            supabase: createAdminClient(),
            tenantId: membership.tenant_id,
            data: parsed.data,
        });

        return {
            success: true,
            message: "Tenant updated successfully.",
            tenant: updatedTenant,
        };
    } catch (error) {
        console.error("Workspace update action error:", {
            tenantSlug,
            error,
        });

        return {
            success: false,
            message: "Failed to update workspace. Please try again.",
        };
    }
}
