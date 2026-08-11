import { redirect } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/shared/types/database.types";

export async function requireUser(
    locale?: string
): Promise<{ supabase: SupabaseClient<Database>; user: User }> {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect({ href: `/${locale ?? "en"}/login`, locale: locale ?? "en" });
        throw new Error("Redirecting to login");
    }

    return {
        supabase,
        user: user as User,
    };
}