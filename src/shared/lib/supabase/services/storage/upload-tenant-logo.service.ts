import type { SupabaseClient } from "@supabase/supabase-js";

type UploadTenantLogoProps = {
    supabase: SupabaseClient;
    tenantId: string;
    file: File;
};

export async function uploadTenantLogoService({
    supabase,
    tenantId,
    file,
}: UploadTenantLogoProps) {
    // حذف أي لوجو قديم داخل فولدر الـ Tenant
    const { data: files, error: listError } = await supabase.storage
        .from("tenant-logos")
        .list(tenantId);

    if (listError) {
        throw listError;
    }

    if (files && files.length > 0) {
        const paths = files.map(
            (file) => `${tenantId}/${file.name}`
        );

        const { error: deleteError } =
            await supabase.storage
                .from("tenant-logos")
                .remove(paths);

        if (deleteError) {
            throw deleteError;
        }
    }

    const extension = file.name.split(".").pop();

    const path = `${tenantId}/logo.${extension}`;

    const { error: uploadError } = await supabase.storage
        .from("tenant-logos")
        .upload(path, file, {
            cacheControl: "3600",
            upsert: true,
        });

    if (uploadError) {
        throw uploadError;
    }

    const {
        data: { publicUrl },
    } = supabase.storage
        .from("tenant-logos")
        .getPublicUrl(path);

    return publicUrl;
}