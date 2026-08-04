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

type Props = {
    locale: string
    tenantSlug: string
}

export default function InviteMemberForm({
    locale,
    tenantSlug,
}: Props) {

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
            const result = await createInvitationAction(
                locale,
                tenantSlug,
                data
            )
            console.log("INVITATION RESULT:", result);

            if (result && result.success) {
                toast.success('Invitation sent successfully!')
                reset()
                return
            }

            switch (result?.code) {
                case 'ALREADY_MEMBER':
                    toast.error('This email is already a member of this workspace.')
                    break
                case 'INVALID_INPUT':
                    toast.error('The provided input or role is invalid.')
                    break
                case 'UNAUTHORIZED':
                    toast.error('You do not have the required permissions to send invitations.')
                    break
                case 'OVER_LIMIT':
                    toast.error('You have reached the maximum number of administrators allowed for your current plan.')
                    break
                case 'INVITATION_EXISTS':
                    toast.error('An active invitation has already been sent to this email.')
                    break
                default:
                    toast.error('Failed to send invitation. Please try again.')
                    break
            }
        } catch (error) {
            console.error('An unexpected error occurred:', error)
            toast.error('A server connection error occurred. Please try again later.')
        }
    }

    return (
        <div className="max-w-xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight">Invite Member</CardTitle>
                <CardDescription>
                    Invite a new collaborator to join your workspace and assign their role.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5"
                >
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Email Address</label>
                        <Controller
                            control={control}
                            name="email"
                            render={({ field }) => (
                                <Input
                                    type="email"
                                    placeholder="colleague@example.com"
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
                        <label className="text-sm font-semibold text-slate-700">Workspace Role</label>
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
                            Roles define the level of access and permissions this member will have.
                        </p>
                        {errors.role && (
                            <p className="text-xs font-medium text-red-500">
                                {errors.role.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Personal Invitation Message</label>
                        <Controller
                            control={control}
                            name="message"
                            render={({ field }) => (
                                <Textarea
                                    rows={4}
                                    placeholder="Write a warm welcome message or let them know what they will be working on (optional)..."
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
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Invitation
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </div>
    )
}   
