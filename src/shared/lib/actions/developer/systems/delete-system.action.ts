'use server'
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { deleteSystem } from "@/shared/lib/supabase/services/systems";
import { SupabaseClient } from "@supabase/supabase-js";
import { getSystemAction } from "./get-system.action";
import { z } from "zod";

export async function deleteSystemAction(id: string) {
    const systemId = z.string().uuid().parse(id);
    const supabase: SupabaseClient = await createSupabaseServerClient()

    const system = await getSystemAction(systemId, supabase)

    if (!system) {
        throw new Error("system error: returned system not found")
    }

    await deleteSystem(systemId, supabase);
    return { success: true as const };
}
