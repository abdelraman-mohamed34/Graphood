'use client';

import React from "react";
import { useTranslations } from "next-intl";
import {
    BookOpen,
    KeyRound,
    Layers,
    FileCode2,
    AlertTriangle,
    History,
    ArrowRight
} from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function DeveloperDocsPage() {
    const t = useTranslations("DeveloperDocsPage");

    const quickLinks = [
        {
            title: t("explore.cards.quickStart.title"),
            description: t("explore.cards.quickStart.description"),
            href: "/developer/docs/quick-start",
            icon: BookOpen,
        },
        {
            title: t("explore.cards.authentication.title"),
            description: t("explore.cards.authentication.description"),
            href: "/developer/docs/authentication",
            icon: KeyRound,
        },
        {
            title: t("explore.cards.endpoints.title"),
            description: t("explore.cards.endpoints.description"),
            href: "/developer/docs/endpoints",
            icon: Layers,
        },
        {
            title: t("explore.cards.responseFormat.title"),
            description: t("explore.cards.responseFormat.description"),
            href: "/developer/docs/response-format",
            icon: FileCode2,
        },
        {
            title: t("explore.cards.errors.title"),
            description: t("explore.cards.errors.description"),
            href: "/developer/docs/errors",
            icon: AlertTriangle,
        },
        {
            title: t("explore.cards.changelog.title"),
            description: t("explore.cards.changelog.description"),
            href: "/developer/docs/changelog",
            icon: History,
        },
    ];

    return (
        <div className="w-full max-w-4xl space-y-10 py-6 px-4 sm:px-6">
            {/* Header Section */}
            <header className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {t("title")}
                </h1>
                <p className="text-base text-muted-foreground sm:text-lg">
                    {t("description")}
                </p>
            </header>

            {/* Banner / Welcome Card */}
            <div className="rounded-sm border bg-card p-6 sm:p-8">
                <div className="max-w-2xl space-y-3">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {t("welcomeBanner.badge")}
                    </span>
                    <h2 className="text-xl font-semibold sm:text-2xl">
                        {t("welcomeBanner.title")}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed sm:text-base">
                        {t("welcomeBanner.description")}
                    </p>
                    <div className="pt-2">
                        <Link
                            href="/developer/docs/quick-start"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            {t("welcomeBanner.button")}
                            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Navigation Grid */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("explore.title")}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {quickLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="group relative flex flex-col justify-between rounded-xl border bg-card p-5 transition-all duration-200 hover:border-primary/50 hover:bg-muted/40 hover:shadow-sm"
                            >
                                <div className="space-y-3">
                                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border bg-background text-foreground shadow-xs group-hover:border-primary/30 group-hover:text-primary">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-semibold text-foreground group-hover:text-primary">
                                        {link.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed sm:text-sm">
                                        {link.description}
                                    </p>
                                </div>
                                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                                    {t("explore.readSection")}
                                    <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
