'use server'

import { redirect } from 'next/navigation'
import { createHash } from 'crypto'
import AcceptInvitationButton from './_components/AcceptInvitationButton'
import { getInvitationByToken } from '@/shared/lib/supabase/services/invitations/get-Invitation-by-token.service'
import { getWhatByFrom } from '@/shared/lib/supabase/services/get-what-by-from.service'
import RejectInvitationButton from './_components/RejectInvitationButton'
import { createAdminClient } from '@/shared/lib/supabase/admin'

type PageProps = {
    params: Promise<{ locale: string }>
    searchParams: Promise<{ token?: string; tenant?: string }>
}

export default async function Page({ params, searchParams }: PageProps) {
    const { locale } = await params
    const { token, tenant } = await searchParams
    const supabase = await createAdminClient()

    if (!token || !tenant) {
        redirect(`/${locale}/not-found`)
    }

    const tokenHash = createHash('sha256')
        .update(token)
        .digest('hex')

    const invitation = await getInvitationByToken(supabase, tokenHash)

    if (!invitation) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
                <div className="max-w-md w-full rounded-lg border border-red-200 bg-white p-6 shadow-sm text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                        <span className="text-red-600 text-xl font-bold">!</span>
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 mb-2">Invalid or Expired Invitation</h1>
                    <p className="text-sm text-slate-600 mb-6">
                        This invitation link is no longer valid, has expired, or is mismatched. Please ask your administrator for a new invite.
                    </p>
                    <a href={`/${locale}`} className="inline-block w-full rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900 transition-colors">
                        Go back home
                    </a>
                </div>
            </div>
        )
    }

    const inviter = await getWhatByFrom<{ first_name: string; last_name: string }>(
        supabase,
        "first_name,last_name",
        invitation?.invited_by,
        "id",
        "profiles"
    )


    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-center mb-6">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 mb-4">
                        <span className="text-indigo-600 text-lg">✉️</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">You&apos;re Invited!</h1>
                    <p className="text-sm text-slate-500 mt-1">Join your team workspace</p>
                </div>

                <div className="rounded-md bg-slate-50 p-4 border border-slate-100 mb-6">
                    <p className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-800">{inviter?.first_name + ' ' + inviter?.last_name}</span> has invited you to join:
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                        <div>
                            <p className="text-base font-bold text-slate-900">{tenant}</p>
                            <p className="text-xs text-slate-500">Role: {invitation.role}</p>
                        </div>
                    </div>
                </div>

                <div className='space-y-3'>
                    <AcceptInvitationButton
                        token={token}
                        tenant={tenant}
                        locale={locale}
                    />
                    <RejectInvitationButton
                        locale={locale}
                        token={token}
                        tenant={tenant}
                    />
                </div>
            </div>
        </div>
    )
}
