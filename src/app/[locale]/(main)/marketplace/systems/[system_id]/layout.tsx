// src/app/[locale]/(main)/marketplace/[system_id]/layout.tsx
'use server'

import { requireUser } from '@/shared/lib/auth/requires/require-user';
import { createAdminClient } from '@/shared/lib/supabase/admin';
import { getSystemById } from '@/shared/lib/supabase/services/systems';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { redirect } from '@/i18n/navigation';
import React from 'react';
import { Dir } from '@/shared/_components/dir';
import { createQueryClient, queryKeys } from '@/shared/lib/query';

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
    const queryClient = createQueryClient();
    const supabase = await createAdminClient();

    const [{ user }, system] = await Promise.all([
        requireUser(locale),
        queryClient.fetchQuery({
            queryKey: queryKeys.systems.detail(system_id),
            queryFn: () => getSystemById(system_id, supabase),
        }),
    ]);

    if (user?.id === system?.owner_id) {
        redirect({
            href: `/developer/systems/${system_id}`,
            locale,
        });
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Dir unroutableSegments={["systems"]} />
            {children}
        </HydrationBoundary>
    );
}
