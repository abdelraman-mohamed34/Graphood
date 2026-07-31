import { System, SystemInsert } from "@/shared/lib/schemas/systems.schema";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

export async function createSystem(
    data: SystemInsert
): Promise<System> {

    const supabase =
        await createSupabaseServerClient();

    const {
        data: record,
        error,
    } = await supabase
        .from("systems")
        .insert(data)
        .select()
        .single();


    if (error) {

        console.error(
            "CREATE SYSTEM ERROR:",
            {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint,
                payload: data,
            }
        );

        throw error;
    }


    return record as System;
}