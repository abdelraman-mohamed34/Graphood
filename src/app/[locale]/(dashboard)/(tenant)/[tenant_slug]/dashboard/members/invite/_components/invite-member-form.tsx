'use client'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createInvitationSchema, type CreateInvitationInput } from '@/shared/lib/schemas/inputs/invitation-inputs.schema'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createInvitationAction } from '@/shared/lib/actions/invitations/create-invitation.action'
import { toast } from 'sonner'

import {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Loader2, Send } from 'lucide-react'
import { RoleSelect } from './role-select'
import { useTranslations } from 'next-intl'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/shared/lib/query'

type Props = {
    locale: string
    tenantSlug: string
}

export default function InviteMemberForm({
    locale,
    tenantSlug,
}: Props) {
    const t = useTranslations('dashboard.members')
    const queryClient = useQueryClient()
    const invitationMutation = useMutation({
        mutationFn: (data: CreateInvitationInput) =>
            createInvitationAction(locale, tenantSlug, data),
        onSuccess: async (result) => {
            if (result.success) {
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.tenants.invitations(tenantSlug),
                })
            }
        },
    })

    const {
        handleSubmit,
        control,
        reset,
        formState: { isSubmitting, errors }
    } = useForm<CreateInvitationInput>({
        resolver: zodResolver(createInvitationSchema),
        defaultValues: {
            email: '',
            role: 'MEMBER',
            permissions: [],
            message: '',
        },
    })

    const onSubmit = async (data: CreateInvitationInput) => {
        try {
            const result = await invitationMutation.mutateAsync(data)

            if (result && result.success) {
                toast.success(t('invite.feedback.sent'))
                reset()
                return
            }

            switch (result?.code) {
                case 'ALREADY_MEMBER':
                    toast.error(t('invite.feedback.alreadyMember'))
                    break
                case 'INVALID_INPUT':
                    toast.error(t('invite.feedback.invalid'))
                    break
                case 'UNAUTHORIZED':
                    toast.error(t('invite.feedback.unauthorized'))
                    break
                case 'OVER_LIMIT':
                    toast.error(t('invite.feedback.overLimit'))
                    break
                case 'INVITATION_EXISTS':
                    toast.error(t('invite.feedback.exists'))
                    break
                default:
                    toast.error(t('invite.feedback.failed'))
                    break
            }
        } catch {
            toast.error(t('invite.feedback.connectionError'))
        }
    }

    return (
        <div className="max-w-xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight">{t('invite.title')}</CardTitle>
                <CardDescription>
                    {t('invite.description')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5"
                >
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">{t('invite.email')}</label>
                        <Controller
                            control={control}
                            name="email"
                            render={({ field }) => (
                                <Input
                                    type="email"
                                    placeholder={t('invite.emailPlaceholder')}
                                    disabled={isSubmitting}
                                    className={`h-10 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                    {...field}
                                />
                            )}
                        />
                        {errors.email && (
                            <p className="text-xs font-medium text-red-500">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">{t('invite.role')}</label>
                        <Controller
                            control={control}
                            name="role"
                            render={({ field }) => (
                                <RoleSelect
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={isSubmitting}
                                />
                            )}
                        />
                        <p className="text-xs text-slate-400">
                            {t('invite.roleDescription')}
                        </p>
                        {errors.role && (
                            <p className="text-xs font-medium text-red-500">
                                {errors.role.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">{t('invite.message')}</label>
                        <Controller
                            control={control}
                            name="message"
                            render={({ field }) => (
                                <Textarea
                                    rows={4}
                                    placeholder={t('invite.messagePlaceholder')}
                                    disabled={isSubmitting}
                                    className="resize-none min-h-[100px]"
                                    value={field.value ?? ''}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                        {errors.message && (
                            <p className="text-xs font-medium text-red-500">
                                {errors.message.message}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-start pt-2">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto bg-primary hover:bg-primary/80 text-white font-medium px-6 py-2.5 transition-all duration-200"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                                    {t('invite.sending')}
                                </>
                            ) : (
                                <>
                                    <Send className="me-2 h-4 w-4" />
                                    {t('invite.send')}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </div>
    )
}   
