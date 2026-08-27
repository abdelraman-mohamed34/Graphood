"use server";

import { z } from "zod";
import { hasPermission } from "@/shared/lib/auth/requires/require-permission";
import { requireMembership } from "@/shared/lib/auth/requires/require-membership";
import { requireUser } from "@/shared/lib/auth/requires/require-user";
import { uploadTenantLogoService } from "@/shared/lib/supabase/services/storage";
import { createAdminClient } from "@/shared/lib/supabase/admin";

const inputSchema = z.object({
    locale: z.enum(["ar", "en"]),
    tenantSlug: z.string().trim().min(1).max(100),
    file: z.instanceof(File)
        .refine((file) => file.size <= 2 * 1024 * 1024, "Image must be 2 MB or smaller.")
        .refine(
            (file) => ["image/png", "image/jpeg", "image/webp"].includes(file.type),
            "Unsupported image type.",
        ),
}).strict();

export async function uploadTenantLogoAction(
    locale: string,
    tenantSlug: string,
    file: File,
) {
    const input = inputSchema.parse({ locale, tenantSlug, file });
    const { user, supabase } = await requireUser(input.locale);
    const membership = await requireMembership({
        tenantSlug: input.tenantSlug,
        userId: user.id,
        supabase,
        redirectTo: `/${input.locale}/workspaces`,
    });

    if (!hasPermission(membership, "tenant.manage")) {
        return { success: false as const, error: "UNAUTHORIZED" };
    }

    const logoUrl = await uploadTenantLogoService({
        // Authorization is checked above with the request-scoped client. The
        // service client avoids requiring per-user Storage object policies.
        supabase: createAdminClient(),
        tenantId: membership.tenant_id,
        file: input.file,
    });

    return { success: true as const, logoUrl };
}
