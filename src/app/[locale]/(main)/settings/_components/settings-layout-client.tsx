"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSelectedLayoutSegment } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Dir } from "@/shared/_components/dir";

export function SettingsLayoutClient({ children }: { children: React.ReactNode }) {
    const locale = useLocale();
    const segment = useSelectedLayoutSegment();
    const t = useTranslations("settings");
    const tabs = useMemo(() => [{ id: "profile", label: t("tabs.profile"), href: `/${locale}/settings/profile` }], [locale, t]);
    return <><Dir /><div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
        <header className="space-y-1"><h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1><p className="text-sm text-muted-foreground">{t("description")}</p></header>
        <nav aria-label="Settings navigation" className="border-b border-border/60"><div className="-mb-px flex gap-6">{tabs.map((tab) => {
            const active = segment === tab.id;
            return <Link key={tab.id} href={tab.href} className={cn("border-b-2 px-1 py-3 text-sm font-medium transition-colors", active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:border-border hover:text-foreground")}>{tab.label}</Link>;
        })}</div></nav>
        <section className="rounded-xl backdrop-blur-sm sm:pb-15">{children}</section>
    </div></>;
}
