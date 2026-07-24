// src/app/[locale]/(main)/marketplace/[system_id]/layout.tsx
'use server'
import { createAdminClient } from '@/shared/lib/supabase/admin';
import { getSystemById } from '@/shared/lib/supabase/services/systems';
import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
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
    const { system_id } = await params;
    const queryClient = new QueryClient();
    const supabase = await createAdminClient();

    await queryClient.fetchQuery({
        queryKey: ['systems', 'details', system_id],
        queryFn: () => getSystemById(system_id, supabase),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {children}
        </HydrationBoundary>
    );
}