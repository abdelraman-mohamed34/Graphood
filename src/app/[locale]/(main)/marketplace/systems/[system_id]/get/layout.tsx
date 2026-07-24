// src/app/[locale]/(main)/marketplace/[system_id]/get/layout.tsx
'use server'

import { createSupabaseServerClient } from '@/shared/lib/supabase/server';
import { fetchUser } from '@/shared/lib/supabase/services/auth/user/fetch-user.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
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
    const supabase: SupabaseClient = await createSupabaseServerClient()
    const user = await fetchUser(supabase)

    if (!system_id) {
        throw new Error('invalid system id')
    }

    if (!user) {
        redirect(`/${locale}/login`)
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {children}
        </HydrationBoundary>
    );
}