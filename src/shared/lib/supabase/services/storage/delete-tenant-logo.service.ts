// src/shared/lib/supabase/services/storage/delete-tenant-logo.service.ts

import type { SupabaseClient } from "@supabase/supabase-js";

type DeleteTenantLogoProps = {
    supabase: SupabaseClient;
    logoUrl: string;
};

export async function deleteTenantLogoService({
    supabase,
    logoUrl,
}: DeleteTenantLogoProps) {
    if (!logoUrl) return;

    const marker = "/storage/v1/object/public/tenant-logos/";

    const index = logoUrl.indexOf(marker);

    if (index === -1) return;

    const path = logoUrl.substring(index + marker.length);

    const { error } = await supabase.storage
        .from("tenant-logos")
        .remove([path]);

    if (error) {
        throw error;
    }
}