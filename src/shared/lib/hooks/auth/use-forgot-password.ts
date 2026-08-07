"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";

import { createClient } from "../../supabase/client";

export function useForgotPassword() {
    const locale = useLocale();
    const t = useTranslations("auth");

    const resetPassword = useMutation({
        mutationFn: async (email: string) => {
            const supabase = createClient();

            const redirectTo = `${window.location.origin}/${locale}/auth/reset-password/callback?next=/${locale}/reset-password`;

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo,
            });

            if (error) {
                throw error;
            }
        },

        onSuccess: () => {
            toast.success(t("success.reset_password_sent"));
        },

        onError: (error) => {
            toast.error(
                error instanceof Error
                    ? error.message
                    : t("errors.generic_reset_password_error")
            );
        },
    });

    return {
        resetPassword: resetPassword.mutateAsync,
        isLoading: resetPassword.isPending,
        isSuccess: resetPassword.isSuccess,
        isError: resetPassword.isError,
        error: resetPassword.error,
    };
}

export default useForgotPassword;