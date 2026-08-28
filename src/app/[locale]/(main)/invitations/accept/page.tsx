'use server'

import { redirect } from 'next/navigation'
import { createHash } from 'crypto'
import AcceptInvitationButton from './_components/AcceptInvitationButton'
import { getInvitationByToken } from '@/shared/lib/supabase/services/invitations/get-Invitation-by-token.service'
import { getWhatByFrom } from '@/shared/lib/supabase/services/get-what-by-from.service'
import RejectInvitationButton from './_components/RejectInvitationButton'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { getTranslations } from 'next-intl/server'

type PageProps = {
    params: Promise<{ locale: string }>
    searchParams: Promise<{ token?: string; tenant?: string }>
}

export default async function Page({ params, searchParams }: PageProps) {
    const { locale } = await params
    const { token, tenant } = await searchParams
    const supabase = await createAdminClient()
    const t = await getTranslations({ locale, namespace: 'invitations' })

    if (!token || !tenant) {
        console.error('Invitation Validation Error:', new Error('Invitation link is missing token or tenant identifier'))
        redirect(`/${locale}/not-found`)
    }

    const tokenHash = createHash('sha256')
        .update(token)
        .digest('hex')

    let invitation
    try {
        invitation = await getInvitationByToken(supabase, tokenHash)
    } catch (error) {
        console.error('Invitation Validation Error:', error)
        invitation = null
    }

    if (!invitation) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="max-w-md w-full rounded-lg border border-red-200 bg-white p-6 shadow-sm text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                        <span className="text-red-600 text-xl font-bold">!</span>
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 mb-2">{t('invalidTitle')}</h1>
                    <p className="text-sm text-slate-600 mb-6">
                        {t('invalidDescription')}
                    </p>
                    <a href={`/${locale}`} className="inline-block w-full rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900 transition-colors">
                        {t('goHome')}
                    </a>
                </div>
            </div>
        )
    }

    let tenantRecord: { id: string; slug: string; name: string } | null = null
    let inviter: { first_name: string; last_name: string } | null = null
    try {
        tenantRecord = await getWhatByFrom<{ id: string; slug: string; name: string }>(supabase, 'id,slug,name', invitation.tenant_id, 'id', 'tenants')
        inviter = await getWhatByFrom<{ first_name: string; last_name: string }>(supabase, 'first_name,last_name', invitation.invited_by, 'id', 'profiles')
    } catch (error) {
        console.error('Invitation Validation Error:', error)
    }

    if (!tenantRecord || (tenant !== tenantRecord.id && tenant !== tenantRecord.slug)) {
        console.error('Invitation Validation Error:', new Error('Tenant identifier does not match invitation'))
        return <div className="flex min-h-screen items-center justify-center bg-background p-4"><div className="max-w-md w-full rounded-lg border border-red-200 bg-white p-6 shadow-sm text-center"><h1 className="text-xl font-bold text-slate-900 mb-2">{t('invalidTitle')}</h1><p className="text-sm text-slate-600 mb-6">{t('invalidDescription')}</p><a href={`/${locale}`} className="inline-block w-full rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white">{t('goHome')}</a></div></div>
    }
    const tenantSlug = tenantRecord.slug


    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="max-w-md w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-center mb-6">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-accent">
                        <span className="text-lg text-teal">✉️</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
                    <p className="text-sm text-slate-500 mt-1">{t('subtitle')}</p>
                </div>

                <div className="mb-6 rounded-sm border border-border bg-muted p-4">
                    <p className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-800">{inviter?.first_name + ' ' + inviter?.last_name}</span> {t('invitedBy')}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                        <div>
                            <p className="text-base font-bold text-slate-900">{tenantRecord.name}</p>
                            <p className="text-xs text-slate-500">{t('role')}: {invitation.role}</p>
                        </div>
                    </div>
                </div>

                <div className='space-y-3'>
                    <AcceptInvitationButton
                        token={token}
                        tenant={tenantSlug}
                        locale={locale}
                    />
                    <RejectInvitationButton
                        locale={locale}
                        token={token}
                        tenant={tenantSlug}
                    />
                </div>
            </div>
        </div>
    )
}
