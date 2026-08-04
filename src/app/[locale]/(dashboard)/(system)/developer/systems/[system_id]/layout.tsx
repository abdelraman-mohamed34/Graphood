import React from "react";
import { redirect, notFound } from "next/navigation";
import { getSystemAction } from "@/shared/lib/actions/developer/systems";
import { System } from "@/shared/lib/schemas/systems.schema";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { SYSTEM_QUERY_KEYS } from "@/shared/lib/hooks/systems/use-system";
import { requireUser } from "@/shared/lib/auth/requires/require-user";
import { fetchProfile } from "@/shared/lib/supabase/services/profile";
import SystemSidebar from "./_components/system-sidebar";

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
    const { user, supabase } = await requireUser(locale);

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
        redirect(`/${locale}/developer?error=unauthorized`);
    }

    const queryClient = new QueryClient();

    await queryClient.fetchQuery({
        queryKey: SYSTEM_QUERY_KEYS.single(system_id),
        queryFn: async () => system,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="flex w-full">
                <SystemSidebar />
                <div className="flex-1">
                    {children}
                </div>
            </div>
        </HydrationBoundary>
    );
}
