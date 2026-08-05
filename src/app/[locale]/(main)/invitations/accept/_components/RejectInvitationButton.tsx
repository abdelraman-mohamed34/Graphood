'use client'

import React, { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { rejectInvitationAction } from '@/shared/lib/actions/invitations/reject-invitation.action'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface RejectButtonProps {
    token: string
    tenant: string
    locale: string
}

export default function RejectInvitationButton({ token, tenant, locale }: RejectButtonProps) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const t = useTranslations('invitationResponse')

    const handleReject = () => {
        startTransition(async () => {
            try {
                const result = await rejectInvitationAction(token, tenant)

                if (result && result.success) {
                    toast.success(t('rejected'))
                    await new Promise((resolve) => setTimeout(resolve, 800))
                    router.push(`/${locale}/invitations/rejected`)
                } else {
                    toast.error(t('rejectFailed'))
                }
            } catch {
                toast.error(t('rejectFailed'))
            }
        })
    }

    return (
        <button
            onClick={handleReject}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 border border-red-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isPending && (
                <svg className="animate-spin h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}
            {isPending ? t('rejecting') : t('reject')}
        </button>
    )
}
