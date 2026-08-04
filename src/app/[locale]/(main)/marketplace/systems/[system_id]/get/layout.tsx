// src/app/[locale]/(main)/marketplace/[system_id]/get/layout.tsx
'use server'

import { requireUser } from '@/shared/lib/auth/requires/require-user';
import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import React from 'react';

interface GetSystemLayoutProps {
    children: React.ReactNode;
    params: Promise<{
        locale: string;
        system_id: string;
    }>;
}

export default async function GetSystemLayout({
    children,
    params,
}: GetSystemLayoutProps) {
    const { system_id, locale } = await params;
    const queryClient = new QueryClient();
    await requireUser(locale)

    if (!system_id) {
        throw new Error('invalid system id')
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {children}
        </HydrationBoundary>
    );
}
