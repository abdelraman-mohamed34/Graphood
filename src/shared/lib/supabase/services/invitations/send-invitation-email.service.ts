import { Resend } from 'resend'
import { getResendApiKey, getResendDeliveryConfig } from '@/shared/lib/email/resend-config'

type Props = {
    email: string
    token: string
    locale: string
    tenantSlug: string
    tenantName?: string
    inviterName: string
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
    const apiKey = getResendApiKey('Invitation email')
    if (!apiKey) {
        throw new Error('RESEND_API_KEY is missing; invitation email was not sent.')
    }

    const delivery = getResendDeliveryConfig(email)
    const resend = new Resend(apiKey)
    const acceptUrl =
        `${process.env.NEXT_PUBLIC_APP_URL}` +
        `/${locale}/invitations/accept?token=${token}&tenant=${tenantSlug}`

    const { data, error } = await resend.emails.send({
        from: delivery.from,
        to: delivery.to,
        subject: `You're invited to join ${tenantName}`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation to join ${tenantName}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            width: 100% !important;
            background-color: #f8fafc;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
        }
        table {
            border-collapse: separate;
        }
        .wrapper {
            background-color: #f8fafc;
            width: 100%;
            padding: 48px 20px;
        }
        .container {
            max-width: 540px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            overflow: hidden;
        }
        .content {
            padding: 40px;
        }
        .logo-placeholder {
            font-size: 20px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 24px;
            letter-spacing: -0.025em;
        }
        h2 {
            color: #0f172a;
            font-size: 22px;
            font-weight: 700;
            line-height: 1.3;
            margin: 0 0 16px 0;
            letter-spacing: -0.025em;
            text-align: center;
        }
        p {
            color: #475569;
            font-size: 15px;
            line-height: 1.6;
            margin: 0 0 24px 0;
            text-align: center;
        }
        .message-box {
            background-color: #f1f5f9;
            border-left: 4px solid #6366f1;
            padding: 16px;
            border-radius: 0 8px 8px 0;
            margin-bottom: 32px;
            text-align: left;
        }
        .message-title {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
            font-weight: 700;
            margin: 0 0 6px 0;
            text-align: left;
        }
        .message-text {
            color: #334155;
            font-size: 14px;
            line-height: 1.5;
            margin: 0;
            font-style: italic;
            text-align: left;
        }
        .btn-container {
            padding: 10px 0 32px 0;
            text-align: center;
        }
        .btn {
            display: inline-block;
            background-color: #4f46e5;
            color: #ffffff !important;
            font-size: 15px;
            font-weight: 600;
            text-decoration: none;
            padding: 12px 32px;
            border-radius: 8px;
            text-align: center;
            transition: background-color 0.2s ease;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .footer {
            padding: 0 40px 40px 40px;
            border-top: 1px solid #f1f5f9;
            text-align: center;
        }
        .footer-text {
            color: #94a3b8;
            font-size: 12px;
            line-height: 1.5;
            margin: 24px 0 0 0;
        }
        .footer-link {
            color: #64748b;
            text-decoration: underline;
        }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <table role="presentation" class="wrapper" cellspacing="0" cellpadding="0">
        <tr>
            <td>
                <table role="presentation" class="container" cellspacing="0" cellpadding="0">
                    <tr>
                        <td class="content">
                            <div class="logo-placeholder" style="text-align: center;">${tenantName}</div>
                            
                            <h2>You've been invited to join ${tenantName}</h2>
                            <p>Hi there! <strong>${inviterName}</strong> has invited you to collaborate and build together. Click below to accept the invitation and get started.</p>

                            ${message ? `
                            <div class="message-box">
                                <p class="message-title">Personal Note</p>
                                <p class="message-text">"${message}"</p>
                            </div>
                            ` : ''}

                            <div class="btn-container">
                                <table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto;">
                                    <tr>
                                        <td align="center" style="border-radius: 8px; background-color: #4f46e5;">
                                            <a href="${acceptUrl}" class="btn" target="_blank">
                                                Accept Invitation
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <p style="font-size: 13px; color: #94a3b8; margin: 0; text-align: center;">
                                If the button above doesn't work, copy and paste this link into your browser:<br>
                                <a href="${acceptUrl}" class="footer-link" style="word-break: break-all;">${acceptUrl}</a>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td class="footer">
                            <p class="footer-text">
                                This invitation was sent to you by ${tenantName}.<br>
                                If you did not expect this invitation, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`,
    })

    if (error) {
        console.error('Invitation Resend Error:', error)
        throw new Error(error.message)
    }

    return data
}
