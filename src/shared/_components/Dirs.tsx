"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function isId(segment: string): boolean {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    const numericRegex = /^\d+$/;
    const opaqueIdRegex = /^[a-zA-Z0-9_-]{20,}$/;

    return uuidRegex.test(segment)
        || (numericRegex.test(segment) && segment.length > 5)
        || opaqueIdRegex.test(segment);
}

function decodeSegment(segment: string): string {
    try {
        return decodeURIComponent(segment);
    } catch {
        return segment;
    }
}

function formatLabel(segment: string): string {
    return decodeSegment(segment)
        .split(/[-_\s]+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toLocaleUpperCase() + word.slice(1))
        .join(" ");
}

const DEFAULT_UNROUTABLE_SEGMENTS = ["system", "developer"];

interface DirProps {
    customLabels?: Record<string, string>;
    unroutableSegments?: readonly string[];
}

export function Dir({
    customLabels = {},
    unroutableSegments = DEFAULT_UNROUTABLE_SEGMENTS,
}: DirProps) {
    const pathname = usePathname();
    const locale = useLocale();
    const t = useTranslations("breadcrumbs");
    const segments = pathname.split("/").filter(Boolean);
    const unroutable = new Set(unroutableSegments);

    return (
        <Breadcrumb className="w-full bg-primary/5 p-4 px-6 md:px-10">
            <BreadcrumbList className="flex items-center text-start">
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/">{t.has("home") ? t("home") : "Home"}</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {segments.map((segment, index) => {
                    const href = `/${segments.slice(0, index + 1).join("/")}`;
                    const isLast = index === segments.length - 1;
                    const decodedSegment = decodeSegment(segment);
                    const isUnroutable = unroutable.has(segment) || unroutable.has(decodedSegment);
                    const label = customLabels[segment]
                        ?? customLabels[decodedSegment]
                        ?? (t.has(segment) ? t(segment) : null)
                        ?? (isId(segment)
                            ? (t.has("details") ? t("details") : "Details")
                            : formatLabel(segment));

                    return (
                        <React.Fragment key={href}>
                            <BreadcrumbSeparator>
                                {locale === "ar" ? (
                                    <ChevronLeft className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                {isLast || isUnroutable ? (
                                    <BreadcrumbPage
                                        className={isUnroutable && !isLast
                                            ? "text-muted-foreground/70"
                                            : "font-medium text-foreground"}
                                    >
                                        {label}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link href={href}>{label}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}