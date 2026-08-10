"use client";

import {
    BookOpen,
    Rocket,
    Shield,
    Braces,
    FileJson,
    CircleAlert,
    History,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { ReusableSidebar, type SidebarGroup } from "@/shared/_components/reusable_sidebar";
import { cn } from "@/lib/utils";

interface DocsSidebarProps {
    className?: string;
}

export default function DocsSidebar({ className }: DocsSidebarProps) {
    const t = useTranslations("DocsSidebar");
    const items: SidebarGroup[] = [
        {
            title: t("groups.gettingStarted"),
            items: [
                {
                    label: t("items.introduction"),
                    href: "/developer/docs",
                    icon: BookOpen,
                    exact: true,
                },
                {
                    label: t("items.quickStart"),
                    href: "/developer/docs/quick-start",
                    icon: Rocket,
                },
                {
                    label: t("items.authentication"),
                    href: "/developer/docs/authentication",
                    icon: Shield,
                },
            ],
        },
        {
            title: t("groups.reference"),
            items: [
                {
                    label: t("items.endpoints"),
                    href: "/developer/docs/endpoints",
                    icon: Braces,
                },
                {
                    label: t("items.responseFormat"),
                    href: "/developer/docs/response-format",
                    icon: FileJson,
                },
                {
                    label: t("items.errors"),
                    href: "/developer/docs/errors",
                    icon: CircleAlert,
                },
                {
                    label: t("items.changelog"),
                    href: "/developer/docs/changelog",
                    icon: History,
                },
            ],
        },
    ];

    return <ReusableSidebar items={items} className={cn(className)} />;
}
