'use client'

import { useState } from 'react'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useInvitations } from '@/shared/lib/hooks'


function Invitations() {

    const {
        pendingInvitations,
        cancelInvitation,
        resendInvitation,
        isCancelling,
        isResending,
        isLoading,
        error,
    } = useInvitations()


    const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null)


    if (isLoading) {
        return (
            <div className="text-sm text-muted-foreground animate-pulse">
                Loading invitations...
            </div>
        )
    }


    if (error) {
        return (
            <div className="text-sm text-red-500">
                Failed to load invitations
            </div>
        )
    }


    return (
        <>
            <div className="space-y-4">

                <div>
                    <h3 className="text-lg font-medium">
                        Pending Invitations
                    </h3>

                    <p className="text-sm text-muted-foreground">
                        Manage invitations that have been sent but not yet accepted.
                    </p>
                </div>


                {pendingInvitations && pendingInvitations.length > 0 ? (

                    <div className="rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">

                        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-left text-sm">

                            <thead className="bg-zinc-50 dark:bg-zinc-900">
                                <tr>
                                    <th className="p-4 font-medium">
                                        Email Address
                                    </th>

                                    <th className="p-4 font-medium">
                                        Role
                                    </th>

                                    <th className="p-4 font-medium">
                                        Expires At
                                    </th>

                                    <th className="p-4 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>


                            <tbody className="divide-y">

                                {pendingInvitations.map((invite) => (

                                    <tr key={invite.id}>

                                        <td className="p-4 font-medium">
                                            {invite.email}
                                        </td>


                                        <td className="p-4">
                                            {invite.role}
                                        </td>


                                        <td className="p-4 text-muted-foreground">
                                            {new Date(invite.expires_at)
                                                .toLocaleDateString()}
                                        </td>


                                        <td className="p-4 text-right space-x-3">

                                            <button
                                                onClick={() =>
                                                    resendInvitation(invite.id)
                                                }
                                                disabled={isResending || isCancelling}
                                                className="text-xs font-semibold text-blue-600 hover:text-blue-500 disabled:opacity-50"
                                            >
                                                {isResending
                                                    ? 'Resending...'
                                                    : 'Resend'}
                                            </button>


                                            <button
                                                onClick={() =>
                                                    setSelectedInvitationId(invite.id)
                                                }
                                                disabled={isCancelling || isResending}
                                                className="text-xs font-semibold text-red-600 hover:text-red-500 disabled:opacity-50"
                                            >
                                                {isCancelling
                                                    ? 'Cancelling...'
                                                    : 'Cancel'}
                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                ) : (

                    <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                        No pending invitations.
                    </div>

                )}

            </div>


            <AlertDialog
                open={!!selectedInvitationId}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedInvitationId(null)
                    }
                }}
            >

                <AlertDialogContent>

                    <AlertDialogHeader>

                        <AlertDialogTitle>
                            Cancel invitation?
                        </AlertDialogTitle>


                        <AlertDialogDescription>
                            This action will cancel the invitation.
                            The invited user will no longer be able to accept it.
                        </AlertDialogDescription>

                    </AlertDialogHeader>


                    <AlertDialogFooter>

                        <AlertDialogCancel>
                            Keep invitation
                        </AlertDialogCancel>


                        <AlertDialogAction
                            onClick={() => {
                                if (selectedInvitationId) {
                                    cancelInvitation(selectedInvitationId)
                                    setSelectedInvitationId(null)
                                }
                            }}
                        >
                            Cancel Invitation
                        </AlertDialogAction>

                    </AlertDialogFooter>

                </AlertDialogContent>

            </AlertDialog>
        </>
    )
}


export default Invitations