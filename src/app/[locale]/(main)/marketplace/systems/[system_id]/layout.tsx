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
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { JsonLd } from '@/shared/_components/json-ld';
import { absoluteUrl, isAppLocale, privateMetadata, publicMetadata, SITE_NAME } from '@/shared/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; system_id: string }> }): Promise<Metadata> {
    const { locale, system_id } = await params;
    if (!isAppLocale(locale)) return {};
    const t = await getTranslations({ locale, namespace: 'seo.system' });
    const system = await getSystemById(system_id, createAdminClient()).catch(() => null);
    if (!system || !system.is_public || system.status !== 'ACTIVE') return { ...privateMetadata, title: t('fallbackTitle'), description: t('fallbackDescription') };
    return publicMetadata({ locale, path: `/marketplace/systems/${system_id}`, title: system.name, description: system.description || t('fallbackDescription'), image: system.image_url });
}

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

    const appLocale = isAppLocale(locale) ? locale : 'en';
    const productSchema = system?.is_public ? {
        "@context": "https://schema.org", "@type": ["Product", "SoftwareSourceCode"],
        name: system.name, description: system.description, image: system.image_url || system.icon_url || undefined,
        url: absoluteUrl(appLocale, `/marketplace/systems/${system_id}`), publisher: { "@type": "Organization", name: SITE_NAME },
        dateModified: system.updated_at, programmingLanguage: "TypeScript",
        offers: [["Starter", system.starter_price], ["Pro", system.pro_price], ["Business", system.business_price], ["Reseller", system.reseller_price], ["Exclusive", system.exclusive_price]]
            .filter((entry): entry is [string, number] => typeof entry[1] === 'number')
            .map(([name, price]) => ({ "@type": "Offer", name, price, priceCurrency: system.currency || 'EGP', availability: "https://schema.org/InStock", url: absoluteUrl(appLocale, `/marketplace/systems/${system_id}`) })),
    } : null;

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {productSchema ? <JsonLd data={productSchema} /> : null}
            <Dir unroutableSegments={["systems"]} />
            {children}
        </HydrationBoundary>
    );
}
