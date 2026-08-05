'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { acceptInvitationAction } from '@/shared/lib/actions/invitations/accept-invitation.action'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

type AcceptInvitationButtonProps = {
    token: string
    tenant: string
    locale: string
}

export default function AcceptInvitationButton({ token, tenant, locale }: AcceptInvitationButtonProps) {
    const router = useRouter()
    const t = useTranslations('invitationResponse')
    const [isLoading, setIsLoading] = useState(false)

    const handleAccept = async () => {
        setIsLoading(true)

        try {
            const result = await acceptInvitationAction(token, tenant)

            if (result && result.success) {
                toast.success(t('accepted'))

                await new Promise((resolve) => setTimeout(resolve, 1000))
                router.push(`/${locale}/${tenant}/dashboard/quickview`)
            } else {
                toast.error(t('acceptFailed'))
                setIsLoading(false)
            }
        } catch {
            toast.error(t('acceptFailed'))
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleAccept}
            disabled={isLoading}
            className="w-full flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('accepting')}
                </>
            ) : (
                t('accept')
            )}
        </button>
    )
}
