"use client";

import { useLocale } from "next-intl";
import {
    usePathname,
    useRouter,
} from "@/i18n/navigation";

export function useLocaleSwitcher() {
    const locale = useLocale();

    const router = useRouter();

    const pathname = usePathname();

    function changeLocale(newLocale: "ar" | "en") {
        router.replace(pathname, {
            locale: newLocale,
        });
    }

    return {
        locale,
        changeLocale,
    };
}