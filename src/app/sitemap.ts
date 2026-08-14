import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { SITE_URL, SUPPORTED_LOCALES } from "@/shared/lib/seo";

const staticRoutes = ["", "/about", "/faq", "/marketplace"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();
    const entries: MetadataRoute.Sitemap = staticRoutes.flatMap((path) =>
        SUPPORTED_LOCALES.map((locale) => ({
            url: `${SITE_URL}/${locale}${path}`,
            lastModified: now,
            changeFrequency: path === "" ? "weekly" as const : "monthly" as const,
            priority: path === "" ? 1 : path === "/marketplace" ? 0.9 : 0.7,
            alternates: { languages: { ar: `${SITE_URL}/ar${path}`, en: `${SITE_URL}/en${path}`, "x-default": `${SITE_URL}/en${path}` } },
        })),
    );

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return entries;

    try {
        const supabase = createClient(url, key, { auth: { persistSession: false } });
        const { data, error } = await supabase.from("systems").select("id, updated_at").eq("is_public", true).eq("status", "ACTIVE").order("updated_at", { ascending: false });
        if (error) throw error;
        for (const system of data ?? []) {
            const path = `/marketplace/systems/${system.id}`;
            for (const locale of SUPPORTED_LOCALES) entries.push({
                url: `${SITE_URL}/${locale}${path}`,
                lastModified: system.updated_at ? new Date(system.updated_at) : now,
                changeFrequency: "weekly",
                priority: 0.8,
                alternates: { languages: { ar: `${SITE_URL}/ar${path}`, en: `${SITE_URL}/en${path}`, "x-default": `${SITE_URL}/en${path}` } },
            });
        }
    } catch { /* Keep static sitemap available if the data service is temporarily unavailable. */ }
    return entries;
}
