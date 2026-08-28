"use client";

import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";

import { RegisterInputType } from "../../schemas";
import { createClient } from "../../supabase/client";
import { acceptInvitationAction } from "../../actions/invitations/accept-invitation.action";
import { sendWelcomeEmailAction } from "../../actions/auth/send-welcome-email.action";
import useOAuth from "./use-OAuth";

export function useRegister() {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("auth");

    const params = useSearchParams();

    const token = params.get("token");
    const tenant = params.get("tenant");

    const { signInWithProvider, isOAuthLoading } = useOAuth();

    const loginPath = () => {
        const path = token && tenant ? `/login?token=${token}&tenant=${tenant}` : `/login`;
        return `/${locale}${path}`;
    };

    const signUpWithPassword = useMutation({
        mutationFn: async ({ email, password, first_name, last_name }: RegisterInputType) => {
            const supabase = createClient();

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/${locale}/workspaces`,
                    data: {
                        first_name,
                        last_name,
                    },
                },
            });

            if (error) {
                throw error;
            }

            if (!data.user) {
                throw new Error(t("errors.generic_register_error"));
            }

            return data;
        },

        onSuccess: async (authData) => {
            const registeredUser = authData.user;
            if (!registeredUser) return;

            if (registeredUser.email) {
                // Email delivery is best-effort and must not block onboarding.
                void sendWelcomeEmailAction({
                    to: registeredUser.email,
                    name: [registeredUser.user_metadata?.first_name, registeredUser.user_metadata?.last_name].filter(Boolean).join(" "),
                    locale: locale === "ar" ? "ar" : "en",
                }).catch((error) => console.error("Welcome email dispatch failed:", error));
            }

            if (!authData.session) {
                toast.info(t("errors.confirm_email"));
                router.replace(loginPath());
                return;
            }

            toast.success(t("success.register"));


            if (token && tenant) {
                try {
                    await acceptInvitationAction(token, tenant);
                    router.replace(`/workspaces`);
                    router.refresh();
                } catch {
                    toast.error(t("errors.invitation_auto_accept_error"));
                    router.replace(`/invitations/accept?token=${token}&tenant=${tenant}`);
                }
                return;
            }

            router.replace(`/workspaces`);
            router.refresh();
        },

        onError: (error) => {
            toast.error(
                error instanceof Error ? error.message : t("errors.generic_register_error")
            );
        },
    });

    return {
        signUpWithPassword: signUpWithPassword.mutateAsync,
        signInWithProvider,
        isRegisterLoading: signUpWithPassword.isPending,
        isOAuthLoading,
        isSuccess: signUpWithPassword.isSuccess,
        isError: signUpWithPassword.isError,
        error: signUpWithPassword.error,
    };
}
