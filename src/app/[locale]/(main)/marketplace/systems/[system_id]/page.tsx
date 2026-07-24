// src/app/[locale]/(main)/marketplace/[system_id]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/shared/lib/supabase/client'
import { getSystemById } from '@/shared/lib/supabase/services/systems'
import { Building2, Calendar, Tag, CheckCircle2 } from 'lucide-react'
import CheckoutButton from './_components/check-out-btn'

export default function Page() {
    const params = useParams();
    const systemId = (params?.system_id || params?.id) as string;

    const supabase = createClient();

    const { data: system, isLoading, error } = useQuery({
        queryKey: ['systems', 'details', systemId],
        queryFn: () => getSystemById(systemId, supabase),
        enabled: !!systemId,
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !system) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500">
                <p>Failed to load system details.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 items-start justify-between border-b border-neutral-200 dark:border-neutral-800 pb-8">
                <div className="flex items-start gap-5">
                    {/* Icon Container */}
                    <div className="w-20 h-20 rounded-2xl bg-neutral-900 flex items-center justify-center shrink-0 border border-neutral-800 shadow-sm overflow-hidden">
                        {system.icon_url ? (
                            <img
                                src={system.icon_url}
                                alt={system.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Building2 className="w-10 h-10 text-neutral-400" />
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
                                {system.name}
                            </h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${system.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-neutral-500/10 text-neutral-400'
                                }`}>
                                {system.status}
                            </span>
                        </div>
                        <p className="text-sm text-neutral-500 font-mono">
                            Slug: {system.slug}
                        </p>
                    </div>
                </div>

                {/* Price Box */}
                <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 w-full md:w-auto min-w-[200px]">
                    <span className="text-xs text-neutral-500 font-medium">Price</span>
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-bold text-neutral-900 dark:text-white">
                            {system.base_price}
                        </span>
                        <span className="text-sm font-semibold text-neutral-500">
                            {system.currency || 'USD'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Details Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            Description
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-base">
                            {system.description || 'No description provided.'}
                        </p>
                    </div>
                </div>

                {/* Meta Sidebar */}
                <div className="bg-neutral-50 dark:bg-neutral-900/40 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 space-y-4 h-fit">
                    <h3 className="font-semibold text-neutral-900 dark:text-white text-sm border-b border-neutral-200 dark:border-neutral-800 pb-3">
                        System Overview
                    </h3>

                    <div className="space-y-3.5 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-neutral-500 flex items-center gap-2">
                                <Tag className="w-4 h-4" /> Category
                            </span>
                            <span className="font-medium text-neutral-800 dark:text-neutral-200">
                                {system.category || 'Uncategorized'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-neutral-500 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Public Access
                            </span>
                            <span className="font-medium text-neutral-800 dark:text-neutral-200">
                                {system.is_public ? 'Yes' : 'No'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-neutral-500 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Created At
                            </span>
                            <span className="font-medium text-neutral-800 dark:text-neutral-200">
                                {new Date(system.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <CheckoutButton systemId={systemId} />
        </div>
    );
}