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

            const redirectTo = new URL(
                `/${locale}/auth/callback`,
                window.location.origin
            ).toString();

            const { error } =
                await supabase.auth.signInWithOAuth({
                    provider,
                    options: {
                        redirectTo,

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

        } catch (error) {
            console.error("OAuth Error:", error);

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