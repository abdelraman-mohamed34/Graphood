"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export function AuthToastListener() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations("auth");
    const hasShown = useRef(false);

    useEffect(() => {
        const welcome = searchParams.get("welcome") === "true";
        const firstTime = searchParams.get("firstTime") === "true";
        if ((!welcome && !firstTime) || hasShown.current) return;

        hasShown.current = true;
        const name = searchParams.get("name")?.trim();
        toast.success(firstTime ? t("success.welcome_first_time", { name: name || t("success.default_name") }) : t("success.welcome_back"));

        const nextParams = new URLSearchParams(searchParams.toString());
        nextParams.delete("welcome");
        nextParams.delete("firstTime");
        nextParams.delete("name");
        const query = nextParams.toString();
        router.replace(query ? `${pathname}?${query}` : pathname);
    }, [pathname, router, searchParams, t]);

    return null;
}
