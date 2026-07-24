"use client";

import React from "react";
import Link from "next/link";
import { useParams, useSelectedLayoutSegment } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const segment = useSelectedLayoutSegment();
    const t = useTranslations('settings');

    const locale = params.locale as string;

    const basePath = `/${locale}/settings`;

    const tabs = [
        { id: "profile", label: t("tabs.profile"), href: `${basePath}/profile` },
        { id: "notifications", label: t("tabs.notifications"), href: `${basePath}/notifications` },
        { id: "developer", label: t("tabs.developer"), href: `${basePath}/developer` },
    ];

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {t("title")}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {t("description")}
                </p>
            </div>

            <div className="border-b border-border/60">
                <nav className="flex gap-6 -mb-px" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const isActive = segment === tab.id;

                        return (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                className={cn(
                                    "py-3 px-1 border-b-2 text-sm font-medium transition-all duration-200 whitespace-nowrap",
                                    isActive
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                                )}
                            >
                                {tab.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-6 bg-card/40 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
                {children}
            </div>
        </div>
    );
}