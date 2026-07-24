'use client'

import {
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import { useParams } from 'next/navigation'

import { createClient } from '@/shared/lib/supabase/client'

import { getPendingInvitations } from '@/shared/lib/supabase/services/invitations/get-pending-invitations.service'

import { cancelInvitationAction } from '@/shared/lib/actions/invitations/cancel-invitation.action'
import { resendInvitationAction } from '@/shared/lib/actions/invitations/resend-invitation.action'
import { useTenant } from '@/shared/lib/hooks'


export function useInvitations() {
    const { locale, tenant_slug } = useParams<{
        locale: string
        tenant_slug: string
    }>()

    const supabase = createClient()
    const queryClient = useQueryClient()

    const { membership } = useTenant()


    const invalidateInvitations = () =>
        queryClient.invalidateQueries({
            queryKey: ['pending-invitations', tenant_slug],
        })


    // Read pending invitations
    const {
        data: pendingInvitations,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['pending-invitations', tenant_slug],

        queryFn: async () => {
            const tenantId = membership?.tenant_id

            if (!tenantId) {
                throw new Error('Tenant not found')
            }

            return getPendingInvitations({
                supabase,
                tenantId,
            })
        },

        enabled: !!tenant_slug && !!membership?.tenant_id,
    })


    // Cancel invitation
    const cancelMutation = useMutation({
        mutationFn: async (invitationId: string) => {
            const result = await cancelInvitationAction(
                locale,
                tenant_slug,
                invitationId
            )

            if (!result.success) {
                throw new Error(result.code)
            }

            return result
        },

        onError: (error) => {
            console.error('Cancel invitation error:', error)
        },

        onSuccess: async () => {
            await invalidateInvitations()
        },
    })


    // Resend invitation
    const resendMutation = useMutation({
        mutationFn: async (invitationId: string) => {
            const result = await resendInvitationAction(
                locale,
                tenant_slug,
                invitationId
            )

            if (!result.success) {
                throw new Error(result.code)
            }

            return result
        },

        onError: (error) => {
            console.error('Resend invitation error:', error)
        },

        onSuccess: async () => {
            await invalidateInvitations()
        },
    })


    return {
        pendingInvitations,

        isLoading,
        error,
        refetch,

        // Cancel
        cancelInvitation: cancelMutation.mutate,
        cancelInvitationAsync: cancelMutation.mutateAsync,
        isCancelling: cancelMutation.isPending,

        // Resend
        resendInvitation: resendMutation.mutate,
        resendInvitationAsync: resendMutation.mutateAsync,
        isResending: resendMutation.isPending,
    }
}