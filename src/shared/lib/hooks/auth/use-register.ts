'use client'

import { useMemo } from "react"
import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { RegisterInputType } from "../../schemas"
import { createClient } from "../../supabase/client"
import { useSearchParams } from "next/navigation"
import { acceptInvitationAction } from "../../actions/invitations/accept-invitation.action"

export function useRegister() {
    const router = useRouter()
    const t = useTranslations("auth")
    const supabase = useMemo(() => createClient(), [])
    const params = useSearchParams()
    const token = params.get('token')
    const tenant = params.get('tenant')

    const loginPath = () => {
        if (token && tenant) {
            return `/login?token=${token}&tenant=${tenant}`
        } else {
            return `/login`
        }
    }

    const signUpWithPassword = useMutation({
        mutationFn: async ({ email, password, first_name, last_name }: RegisterInputType) => {
            const redirectTo =
                typeof window !== "undefined"
                    ? `${window.location.origin}/workspaces`
                    : undefined

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: redirectTo,
                    data: {
                        first_name,
                        last_name,
                    },
                },
            })

            if (error) throw error
            if (!data.user) throw new Error(t("errors.generic_register_error"))

            return data
        },

        onSuccess: async (authData) => {
            if (authData.session) {
                toast.success(t("success.register"))

                if (token && tenant) {
                    try {
                        await acceptInvitationAction(token, tenant);

                        router.replace(`/${tenant}/dashboard`);
                        router.refresh();
                    } catch {
                        toast.error("Failed to auto-accept invitation. Redirecting...");
                        router.replace(`/invitations/accept?token=${token}&tenant=${tenant}`);
                    }
                } else {
                    router.replace("/workspaces")
                    router.refresh()
                }
            } else {
                toast.info(t("errors.confirm_email"))
                router.replace(loginPath())
            }
        },

        onError: (error: Error) => {
            const message = error.message || t("errors.generic_register_error")
            toast.error(message)
        },
    })

    return {
        signUpWithPassword: signUpWithPassword.mutate,
        isLoading: signUpWithPassword.isPending,
        isSuccess: signUpWithPassword.isSuccess,
        isError: signUpWithPassword.isError,
        error: signUpWithPassword.error,
    }
}
