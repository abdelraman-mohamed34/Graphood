import { createClient } from "@/shared/lib/supabase/client";
import { tagSchema, type Tag } from "@/shared/lib/schemas/tags.schema";

export async function getTags(): Promise<Tag[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("tags")
        .select("id, slug, name_en, name_ar, created_at")
        .order("name_en", { ascending: true });

    if (error) {
        throw new Error(`Failed to fetch tags: ${error.message}`);
    }

    return tagSchema.array().parse(data ?? []);
}
