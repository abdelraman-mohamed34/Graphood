'use client';

import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";

import { createClient } from "../../supabase/client";
import { LoginInputType } from "../../schemas";
import useOAuth from "./use-OAuth";

export function useLogin() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations("auth");

    const { signInWithProvider, isOAuthLoading } = useOAuth();

    const redirectAfterLogin = useCallback(() => {
        const token = searchParams.get("token");
        const tenant = searchParams.get("tenant");

        if (token && tenant) {
            router.push(
                `/invitations/accept?token=${token}&tenant=${tenant}&welcome=true`
            );
        } else {
            router.push("/?welcome=true");
        }

        router.refresh();

    }, [router, searchParams]);


    const signInWithPassword = useMutation({
        mutationFn: async ({
            email,
            password,
        }: LoginInputType) => {

            const supabase = createClient();

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            return data;
        },

        onSuccess: () => {
            redirectAfterLogin();
        },

        onError: (error) => {
            toast.error(
                error instanceof Error
                    ? error.message
                    : t("errors.generic_login_error")
            );
        },
    });


    const signOut = useMutation({
        mutationFn: async () => {
            const supabase = createClient();
            const { error } = await supabase.auth.signOut();

            if (error) {
                throw error;
            }
        },

        onSuccess: () => {
            toast.success(
                t("success.signout")
            );
            router.push("/");
            router.refresh();
        },

        onError: (error) => {

            toast.error(
                error instanceof Error
                    ? error.message
                    : t("errors.generic_logout_error")
            );
        },

    });

    return {
        signInWithPassword: signInWithPassword.mutateAsync,
        signInWithProvider,
        signOut: signOut.mutateAsync,

        isPasswordLoading: signInWithPassword.isPending,

        isOAuthLoading,
        isSignOutLoading: signOut.isPending,

        isSuccess: signInWithPassword.isSuccess,

        isError: signInWithPassword.isError,

        error: signInWithPassword.error,
    };
}
