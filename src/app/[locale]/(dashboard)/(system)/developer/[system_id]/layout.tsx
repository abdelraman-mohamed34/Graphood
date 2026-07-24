import React from "react";
import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { redirect, notFound } from "next/navigation";
import { fetchProfile } from "@/shared/lib/supabase/services/auth/profile/fetch-profile.service";
import { getSystemAction } from "@/shared/lib/actions/developer/systems";
import { System } from "@/shared/lib/schemas/systems.schema";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { SYSTEM_QUERY_KEYS } from "@/shared/lib/hooks/systems/use-system";

interface SystemDetailLayoutProps {
    children: React.ReactNode;
    params: Promise<{
        locale: string;
        system_id: string;
    }>;
}

export default async function SystemDetailLayout({
    children,
    params,
}: SystemDetailLayoutProps) {
    const { locale, system_id } = await params;
    const supabase: SupabaseClient = await createSupabaseServerClient();

    const user = await fetchUser(supabase);

    if (!user) {
        redirect(`/${locale}/login`);
    }

    const profile = await fetchProfile(supabase, user.id);

    if (!profile) {
        throw new Error("profile not found");
    }

    const system: System = await getSystemAction(system_id, supabase);

    if (!system) {
        notFound();
    }

    if (system.owner_id !== user.id) {
        redirect(`/${locale}/developer`);
    }

    const queryClient = new QueryClient();

    await queryClient.fetchQuery({
        queryKey: ["develop", "system", system_id],
        queryFn: async () => system,
    });

    // 3. تمرير الكاش المجهز للكلاينت عبر HydrationBoundary
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {children}
        </HydrationBoundary>
    );
}