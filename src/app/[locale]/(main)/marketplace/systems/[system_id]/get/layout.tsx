// src/app/[locale]/(main)/marketplace/[system_id]/get/layout.tsx
'use server'

import { requireUser } from '@/shared/lib/auth/requires/require-user';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import React from 'react';
import { createQueryClient } from '@/shared/lib/query';

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
    const queryClient = createQueryClient();
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
