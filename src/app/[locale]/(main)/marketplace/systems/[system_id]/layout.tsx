// src/app/[locale]/(main)/marketplace/[system_id]/layout.tsx
'use server'
import { requireUser } from '@/shared/lib/auth/requires/require-user';
import { createAdminClient } from '@/shared/lib/supabase/admin';
import { getSystemById } from '@/shared/lib/supabase/services/systems';
import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import React from 'react';

interface SystemDetailsLayoutProps {
    children: React.ReactNode;
    params: Promise<{
        locale: string;
        system_id: string;
    }>;
}

export default async function SystemDetailsLayout({
    children,
    params,
}: SystemDetailsLayoutProps) {
    const { system_id, locale } = await params;
    const queryClient = new QueryClient();
    const supabase = await createAdminClient();
    const { user } = await requireUser(locale)

    const system = await queryClient.fetchQuery({
        queryKey: ['systems', 'details', system_id],
        queryFn: () => getSystemById(system_id, supabase),
    });

    if (user.id === system.owner_id) {
        redirect(`/${locale}/developer/system/${system_id}`);
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {children}
        </HydrationBoundary>
    );
}