'use server';

import { requireUser } from "@/shared/lib/auth/requires/require-user";
import { getCurrentSystems } from "@/shared/lib/supabase/services/systems/get-current-systems.service";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { redirect } from "next/navigation";

interface SystemLayoutProps {
    children: React.ReactNode;
    params: Promise<{
        locale: string;
    }>;
}

export default async function SystemLayout({
    children,
    params,
}: SystemLayoutProps) {
    const { locale } = await params;
    const { user, supabase } = await requireUser(locale)

    if (!user) { redirect(`/${locale}/login`); }
    const queryClient = new QueryClient();

    await queryClient.fetchQuery({
        queryKey: ["develop", "current-systems"],
        queryFn: () => getCurrentSystems(user.id, supabase),
    });
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {children}
        </HydrationBoundary>
    );
}