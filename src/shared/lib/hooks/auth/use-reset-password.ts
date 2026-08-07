"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { createClient } from "@/shared/lib/supabase/client";
import { useRouter } from "next/navigation";

export function useResetPassword() {
    const t = useTranslations("auth");
    const router = useRouter()

    const updatePassword = useMutation({
        mutationFn: async (password: string) => {
            const supabase = createClient();

            const { error } = await supabase.auth.updateUser({
                password,
            });

            router.replace("/login");

            if (error) {
                throw error;
            }
        },

        onSuccess: () => {
            toast.success(t("success.password_updated"));
        },

        onError: (error) => {
            toast.error(
                error instanceof Error
                    ? error.message
                    : t("errors.generic_password_update_error")
            );
        },
    });

    return {
        updatePassword: updatePassword.mutateAsync,
        isLoading: updatePassword.isPending,
        isSuccess: updatePassword.isSuccess,
        isError: updatePassword.isError,
        error: updatePassword.error,
    };
}

export default useResetPassword;