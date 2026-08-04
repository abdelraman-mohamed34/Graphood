'use client';

import React from "react";
import { Sparkles, Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import { InlineCode } from "@/shared/_components/inline-code";

interface ReleaseLog {
    version: string;
    date: string;
    isLatest?: boolean;
    changes: {
        type: "feature" | "improvement" | "fix" | "breaking";
        text: React.ReactNode;
    }[];
}

export default function ChangelogPage() {
    const t = useTranslations("ChangelogPage");

    const releases: ReleaseLog[] = [
        {
            version: "v1.0.0",
            date: t("releases.v1_0_0.date"),
            isLatest: true,
            changes: [
                {
                    type: "feature",
                    text: t("releases.v1_0_0.changes.initial"),
                },
                {
                    type: "feature",
                    text: t.rich("releases.v1_0_0.changes.meEndpoint", {
                        code1: (chunks) => <InlineCode>{chunks}</InlineCode>,
                    }),
                },
                {
                    type: "feature",
                    text: t.rich("releases.v1_0_0.changes.coreEndpoints", {
                        code1: (chunks) => <InlineCode>{chunks}</InlineCode>,
                        code2: (chunks) => <InlineCode>{chunks}</InlineCode>,
                        code3: (chunks) => <InlineCode>{chunks}</InlineCode>,
                    }),
                },
                {
                    type: "feature",
                    text: t.rich("releases.v1_0_0.changes.healthEndpoint", {
                        code1: (chunks) => <InlineCode>{chunks}</InlineCode>,
                    }),
                },
                {
                    type: "improvement",
                    text: t("releases.v1_0_0.changes.auth"),
                },
                {
                    type: "improvement",
                    text: t("releases.v1_0_0.changes.schema"),
                },
            ],
        },
    ];

    const getBadgeStyle = (type: ReleaseLog["changes"][0]["type"]) => {
        switch (type) {
            case "feature":
                return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
            case "improvement":
                return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
            case "fix":
                return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
            case "breaking":
                return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
        }
    };

    return (
        <div className="w-full max-w-4xl space-y-10 py-6 px-4 sm:px-6">
            {/* Header */}
            <header className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {t("title")}
                </h1>

                <p className="text-base text-muted-foreground sm:text-lg">
                    {t("description")}
                </p>
            </header>

            {/* Timeline Wrapper */}
            <section className="relative space-y-10 pl-6 sm:pl-8 ltr:pl-6 ltr:sm:pl-8 rtl:pl-0 rtl:pr-6 rtl:sm:pr-8 before:absolute before:bottom-0 before:top-3 before:w-[2px] before:bg-border ltr:before:left-2 ltr:sm:before:left-3 rtl:before:right-2 rtl:sm:before:right-3">
                {releases.map((release) => (
                    <div key={release.version} className="relative space-y-6">
                        {/* Timeline Node Icon */}
                        <div className="absolute top-1 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-primary shadow-xs ring-4 ring-background ltr:-left-6 ltr:sm:-left-8 rtl:-right-6 rtl:sm:-right-8">
                            <Sparkles className="h-3.5 w-3.5" />
                        </div>

                        {/* Release Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                                    <InlineCode className="text-base sm:text-lg">
                                        {release.version}
                                    </InlineCode>
                                </h2>
                                {release.isLatest && (
                                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                        {t("latestRelease")}
                                    </span>
                                )}
                            </div>

                            <span className="text-sm font-medium text-muted-foreground">
                                {release.date}
                            </span>
                        </div>

                        {/* Changes List */}
                        <ul className="space-y-3.5">
                            {release.changes.map((change, index) => (
                                <li key={index} className="flex items-start gap-3 text-sm">
                                    <span
                                        className={`mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ${getBadgeStyle(
                                            change.type
                                        )}`}
                                    >
                                        <Tag className="h-2.5 w-2.5" />
                                        {t(`types.${change.type}`)}
                                    </span>
                                    <span className="text-muted-foreground leading-relaxed pt-0.5">
                                        {change.text}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </section>
        </div>
    );
}
