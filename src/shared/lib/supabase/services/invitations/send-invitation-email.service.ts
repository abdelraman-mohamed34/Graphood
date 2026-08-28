import { sendSystemEmail } from '@/shared/lib/email/send-system-email'

type Props = {
    email: string
    token: string
    locale: string
    tenantSlug: string
    tenantName?: string
    inviterName?: string
    message?: string | null
}

export async function sendInvitationEmail({
    email,
    token,
    locale,
    tenantSlug,
    tenantName = 'Graphood',
    inviterName,
    message,
}: Props) {
    const resolvedInviterName = inviterName?.trim() || 'Graphood Admin'
    const acceptUrl =
        `${process.env.NEXT_PUBLIC_APP_URL}` +
        `/${locale}/invitations/accept?token=${token}&tenant=${tenantSlug}`

    const result = await sendSystemEmail({ to: email, event: 'MEMBER_INVITED', locale: locale === 'ar' ? 'ar' : 'en', payload: { tenantName, inviterName: resolvedInviterName, acceptUrl, message } })
    if (!result.success) throw result.error
    return result.data
}
