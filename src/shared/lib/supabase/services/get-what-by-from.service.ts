// src/shared/lib/supabase/services/get-what-by-from.service.ts
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getWhatByFrom<T = any>(
    supabase: SupabaseClient,
    what: string,
    value: string,
    by: string,
    from: string,
    value2?: string,
    by2?: string,
): Promise<T | null> {
    let query = supabase
        .from(from)
        .select(what)
        .eq(by, value);

    if (value2 && by2) {
        query = query.eq(by2, value2);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
        console.error(
            `[Supabase Error] Error fetching from ${from}:`,
            JSON.stringify(error, null, 2)
        );
        throw error;
    }

    if (!data) {
        return null;
    }

    if (what.includes(',')) {
        return data as T;
    }

    return data[what as keyof typeof data] as T;
}