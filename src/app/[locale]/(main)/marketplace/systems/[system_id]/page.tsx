'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Building2, CalendarDays, Globe2, Tag } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTags } from '@/shared/lib/hooks/tags/use-tag'
import { createClient } from '@/shared/lib/supabase/client'
import { getSystemById } from '@/shared/lib/supabase/services/systems'

import CheckoutButton from './_components/check-out-btn'
import { queryKeys } from '@/shared/lib/query'

const MarkdownRenderer = dynamic(
    () => import('@/shared/_components/markdown-renderer').then((module) => module.MarkdownRenderer),
    {
        loading: () => <div className="min-h-48 rounded-none border border-border bg-muted" aria-hidden="true" />,
    },
)

export default function Page() {
    const params = useParams<{ system_id: string }>()
    const systemId = params.system_id
    const locale = useLocale()
    const t = useTranslations('marketplace.details')
    const label = (key: string, english: string, arabic: string) => t.has(key) ? t(key) : locale === 'ar' ? arabic : english
    const { data: availableTags = [] } = useTags()
    const supabase = useMemo(() => createClient(), [])

    const { data: system, isLoading, error } = useQuery({
        queryKey: queryKeys.systems.detail(systemId),
        queryFn: () => getSystemById(systemId, supabase),
        enabled: Boolean(systemId),
    })

    if (isLoading) {
        return (
            <div
                className="flex min-h-[60vh] items-center justify-center"
                role="status"
                aria-label={label('loading', 'Loading system details', 'جارٍ تحميل تفاصيل النظام')}
            >
                <div className="size-9 animate-spin rounded-full border-2 border-primary border-t-primary" />
            </div>
        )
    }

    if (error || !system) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center px-4 text-center text-destructive">
                <p>{label('error', 'The system could not be loaded.', 'تعذر تحميل النظام.')}</p>
            </div>
        )
    }

    const systemTags = availableTags.filter((tag) => system.tags?.includes(tag.id))
    const currency = system.currency || 'EGP'
    const price = system.starter_price ?? 0
    let formattedPrice: string

    try {
        formattedPrice = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            maximumFractionDigits: 2,
        }).format(price)
    } catch {
        formattedPrice = `${new Intl.NumberFormat(locale).format(price)} ${currency}`
    }

    return (
        <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 text-start sm:px-6 lg:px-8 lg:py-12">
            <section className="overflow-hidden rounded-sm border border-border bg-white">
                <div className="relative aspect-[21/8] min-h-48 border-b border-border bg-muted">
                    {system.image_url ? (
                        <Image src={system.image_url} alt={t('imageAlt', { name: system.name })} fill sizes="(max-width: 1280px) 100vw, 1280px" className="object-cover" priority />
                    ) : (
                        <div className="absolute inset-0 grid place-items-center bg-white/40 text-center backdrop-blur-sm">
                            <div className="text-muted-foreground"><Building2 className="mx-auto size-10" aria-hidden="true" /><p className="mt-3 text-sm">{t('imageFallback')}</p></div>
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-8">
                    <div className="group relative flex size-20 shrink-0 items-center justify-center overflow-hidden border bg-background/95 transition-shadow hover:shadow-md sm:size-24 md:bg-background/80 md:backdrop-blur">
                        {system.icon_url ? (
                            <Image
                                src={system.icon_url}
                                alt=""
                                fill
                                sizes="(max-width: 640px) 80px, 96px"
                                className="object-cover transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none"
                            />
                        ) : (
                            <Building2 className="size-10 text-muted-foreground sm:size-11" aria-hidden="true" />
                        )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-2 text-start">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="min-w-0 break-words text-2xl font-bold tracking-tight text-maroon sm:text-3xl">
                                {system.name}
                            </h1>
                        </div>
                        <p className="break-all font-mono text-xs text-muted-foreground sm:text-sm">
                            <span className="font-sans font-medium">{label('slug', 'Slug', 'الرابط المختصر')}:</span>{' '}
                            <bdi>{system.slug}</bdi>
                        </p>
                    </div>
                </div>
            </section>

            <div className="mt-8 grid min-w-0 items-start lg:grid-cols-[minmax(0,1fr)_24rem] gap-4">
                <div className="min-w-0">
                    <Card className="overflow-hidden border-border/70 bg-card pt-0 rounded">
                        <CardHeader className="border-b bg-muted/80 px-6 py-5 sm:px-8 rounded-t">
                            <CardTitle className="text-lg font-semibold">
                                {label('readme', 'README', 'نظرة عامة')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 sm:p-8">
                            {system.readme?.trim() ? (
                                <MarkdownRenderer markdown={system.readme} />
                            ) : (
                                <div className="rounded border border-dashed p-8 text-center text-sm text-muted-foreground">
                                    {label('noReadme', 'No README documentation has been provided yet.', 'لم تتم إضافة توثيق README بعد.')}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <aside className="min-w-0 space-y-4 lg:sticky lg:top-8">
                    <Card className="overflow-hidden border-primary rounded">
                        <CardContent className="space-y-5 p-6 text-start">
                            <div className="space-y-1">
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    {label('price', 'Price', 'السعر')}
                                </p>
                                <p className="text-3xl font-bold tracking-tight text-foreground" dir="ltr">
                                    {formattedPrice}
                                </p>
                            </div>
                            <CheckoutButton systemId={systemId} />
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-border/70 lg:flex hidden rounded">
                        <CardHeader className="border-b bg-muted/20 px-5 py-4">
                            <CardTitle className="text-base font-semibold">
                                {label('systemOverview', 'System overview', 'نظرة عامة على النظام')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y p-0 text-start text-sm">
                            <div className="space-y-3 p-5">
                                <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-muted-foreground">
                                    <Tag className="size-4 shrink-0" aria-hidden="true" />
                                    <span className="break-words">{label('categories', 'Categories', 'التصنيفات')}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {systemTags.length > 0 ? systemTags.map((tag) => (
                                        <Badge key={tag.id} variant="secondary" className="max-w-full whitespace-normal break-words rounded px-2.5 py-1 text-start text-xs font-medium">
                                            {locale === 'ar' ? tag.name_ar : tag.name_en}
                                        </Badge>
                                    )) : (
                                        <span className="text-xs text-muted-foreground">
                                            {label('noCategories', 'No categories', 'لا توجد تصنيفات')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-5">
                                <span className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                                    <Globe2 className="size-4 shrink-0" aria-hidden="true" />
                                    <span className="break-words">{label('accessStatus', 'Access status', 'حالة الوصول')}</span>
                                </span>
                                <Badge variant="outline" className="max-w-36 shrink-0 whitespace-normal text-center text-xs font-medium leading-5">
                                    {system.is_public
                                        ? label('publicAccess', 'Public access', 'وصول عام')
                                        : label('privateAccess', 'Private access', 'وصول خاص')}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-5">
                                <span className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                                    <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
                                    <span className="break-words">{label('createdAt', 'Created at', 'تاريخ الإنشاء')}</span>
                                </span>
                                <time dateTime={system.created_at} className="shrink-0 text-xs font-medium text-foreground">
                                    {new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(system.created_at))}
                                </time>
                            </div>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </main>
    )
}
