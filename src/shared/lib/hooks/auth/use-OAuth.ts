'use client';

import { useState } from "react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";

import { createClient } from "../../supabase/client";
import { OAuthProvider } from "@/shared/types/auth.types";

export function useOAuth() {
    const locale = useLocale();
    const t = useTranslations("auth");

    const [isOAuthLoading, setIsOAuthLoading] = useState(false);

    const signInWithProvider = async (
        provider: OAuthProvider = "google"
    ) => {
        if (isOAuthLoading) return;

        setIsOAuthLoading(true);

        try {
            const supabase = createClient();

            const redirectTo = new URL(`/${locale}/auth/callback`, window.location.origin).toString();

            const { data, error } =
                await supabase.auth.signInWithOAuth({
                    provider,
                    options: {
                        redirectTo,
                        skipBrowserRedirect: true,

                        ...(provider === "google" && {
                            queryParams: {
                                access_type: "offline",
                                prompt: "select_account",
                            },
                        }),
                    },
                });

            if (error) {
                throw error;
            }

            if (data?.url) {
                const width = 500;
                const height = 650;
                const left = window.screen.width / 2 - width / 2;
                const top = window.screen.height / 2 - height / 2;

                const popup = window.open(
                    data.url,
                    "Google Sign In",
                    `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=no`
                );

                if (!popup) {
                    toast.error(t("errors.generic_login_error"));
                    setIsOAuthLoading(false);
                    return;
                }

                const timer = setInterval(() => {
                    if (popup.closed) {
                        clearInterval(timer);
                        setIsOAuthLoading(false);
                    }
                }, 500);
            }

        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : t("errors.generic_login_error")
            );

            setIsOAuthLoading(false);
        }
    };

    return {
        signInWithProvider,
        isOAuthLoading,
    };
}

export default useOAuth;
