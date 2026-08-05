"use client";

import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { updateProfileAction } from "@/shared/lib/actions/profile/update-profile.action";
import { useAuth } from "../../auth/auth-context";

export type AppLocale = (typeof routing.locales)[number];

export function useLocaleSwitcher() {
    const locale = useLocale() as AppLocale;
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const changingRef = useRef(false);
    const [isChangingLocale, setIsChangingLocale] = useState(false);

    const changeLocale = async (newLocale: AppLocale) => {
        if (newLocale === locale) return true;
        if (changingRef.current) return false;

        changingRef.current = true;
        setIsChangingLocale(true);

        try {
            // Persist first because the proxy redirects authenticated users to
            // the locale stored in their profile.
            if (user?.id) {
                const result = await updateProfileAction(locale, {
                    preferred_language: newLocale,
                });

                if (!result.success) {
                    throw new Error(`Could not save locale: ${result.code}`);
                }
            }

            const query = searchParams.toString();
            const hash = window.location.hash;
            const href = `${pathname}${query ? `?${query}` : ""}${hash}`;

            router.replace(href, { locale: newLocale });
            return true;
        } catch {
            return false;
        } finally {
            changingRef.current = false;
            setIsChangingLocale(false);
        }
    };

    return { locale, changeLocale, isChangingLocale };
}
