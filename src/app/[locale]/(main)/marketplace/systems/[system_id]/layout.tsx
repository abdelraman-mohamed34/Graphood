// src/app/[locale]/(main)/marketplace/[system_id]/layout.tsx
'use server'

import { requireUser } from '@/shared/lib/auth/requires/require-user';
import { createAdminClient } from '@/shared/lib/supabase/admin';
import { getSystemById } from '@/shared/lib/supabase/services/systems';
import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { redirect } from '@/i18n/navigation';
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

    const [{ user }, system] = await Promise.all([
        requireUser(locale),
        queryClient.fetchQuery({
            queryKey: ['systems', 'details', system_id],
            queryFn: () => getSystemById(system_id, supabase),
        }),
    ]);

    if (user?.id === system?.owner_id) {
        redirect({
            href: `/developer/system/${system_id}`,
            locale,
        });
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {children}
        </HydrationBoundary>
    );
}