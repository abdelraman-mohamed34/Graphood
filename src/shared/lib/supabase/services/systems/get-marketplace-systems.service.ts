import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient as createSupabaseClient } from "@/shared/lib/supabase/client";
import { tagSchema } from "@/shared/lib/schemas/tags.schema";

export interface MarketplaceTag {
    id: string;
    name: string;
    name_ar: string;
    name_en: string;
    slug: string;
}

export interface MarketplaceSystem {
    id: string;
    name: string;
    description: string;
    tags: MarketplaceTag[];
    icon_url: string | null;
    image_url: string | null;
}

interface MarketplaceSystemRecord {
    id: string;
    name: string;
    description: string;
    tags: string[] | null;
    icon_url: string | null;
    image_url: string | null;
}

export async function getMarketplaceSystems(
    client?: SupabaseClient,
): Promise<MarketplaceSystem[]> {
    const supabase = client ?? createSupabaseClient();
    const { data, error } = await supabase
        .from("systems")
        .select("id, name, description, tags, icon_url, image_url")
        .eq("is_public", true)
        .eq("status", "ACTIVE")
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(`Failed to fetch marketplace systems: ${error.message}`);
    }

    const systems = (data ?? []) as MarketplaceSystemRecord[];
    const tagIds = [...new Set(systems.flatMap((system) => system.tags ?? []))];

    if (tagIds.length === 0) {
        return systems.map((system) => ({ ...system, tags: [] }));
    }

    const { data: tagsData, error: tagsError } = await supabase
        .from("tags")
        .select("id, slug, name_en, name_ar, created_at")
        .in("id", tagIds);

    if (tagsError) {
        throw new Error(`Failed to resolve marketplace system tags: ${tagsError.message}`);
    }

    const tagsById = new Map(
        tagSchema.array().parse(tagsData ?? []).map((tag) => [
            tag.id,
            {
                id: tag.id,
                name: tag.name_en,
                name_ar: tag.name_ar,
                name_en: tag.name_en,
                slug: tag.slug,
            } satisfies MarketplaceTag,
        ]),
    );

    return systems.map((system) => ({
        id: system.id,
        name: system.name,
        description: system.description,
        icon_url: system.icon_url,
        image_url: system.image_url,
        tags: (system.tags ?? [])
            .map((tagId) => tagsById.get(tagId))
            .filter((tag): tag is MarketplaceTag => Boolean(tag)),
    }));
}
