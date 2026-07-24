'use client'

import { toast } from "sonner"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { LoginInputType } from "../../schemas"
import { useMutation } from "@tanstack/react-query"
import { createClient } from "../../supabase/client"
import { useSearchParams } from "next/navigation"

export function useLogin() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const t = useTranslations("auth")

    const signInWithProvider = (provider: string = 'google') => {
        console.log(`Redirecting to ${provider} Auth...`);
    }

    const signInWithPassword = useMutation({
        mutationFn: async ({ email, password }: LoginInputType) => {
            const supabase = createClient()
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error
            return data
        },

        onSuccess: () => {
            toast.success(t("success.logged_in"));

            const token = searchParams.get("token")
            const tenant = searchParams.get("tenant")

            if (token && tenant) {
                router.push(`/invitations/accept?token=${token}&tenant=${tenant}`);
            } else {
                router.push("/");
            }

            router.refresh();
        },

        onError: (error: any) => {
            toast.error(error?.message || t("errors.generic_login_error"))
        },
    })

    const signOut = useMutation({
        mutationFn: async () => {
            const supabase = createClient()
            const { error } = await supabase.auth.signOut()
            if (error) throw error
        },

        onSuccess: () => {
            toast.success(t("success.signout"))
            router.push("/")
            router.refresh()
        },

        onError: (error: any) => {
            toast.error(error?.message || t("errors.generic_logout_error"))
        },
    })

    return {
        signInWithPassword: signInWithPassword.mutate,
        signInWithProvider,
        signOut: signOut.mutate,
        isLoading: signInWithPassword.isPending || signOut.isPending,
        isSuccess: signInWithPassword.isSuccess,
        isError: signInWithPassword.isError,
        error: signInWithPassword.error,
    }
}