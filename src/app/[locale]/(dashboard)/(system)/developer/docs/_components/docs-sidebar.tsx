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

import { ReusableSidebar, type SidebarGroup } from "@/shared/_components/reusable_sidebar";
import { cn } from "@/lib/utils";

const items: SidebarGroup[] = [
    {
        title: "Getting Started",
        items: [
            {
                label: "Introduction",
                href: "/developer/docs",
                icon: BookOpen,
                exact: true,
            },
            {
                label: "Quick Start",
                href: "/developer/docs/quick-start",
                icon: Rocket,
            },
            {
                label: "Authentication",
                href: "/developer/docs/authentication",
                icon: Shield,
            },
        ],
    },
    {
        title: "Reference",
        items: [
            {
                label: "Endpoints",
                href: "/developer/docs/endpoints",
                icon: Braces,
            },
            {
                label: "Response Format",
                href: "/developer/docs/response-format",
                icon: FileJson,
            },
            {
                label: "Errors",
                href: "/developer/docs/errors",
                icon: CircleAlert,
            },
            {
                label: "Changelog",
                href: "/developer/docs/changelog",
                icon: History,
            },
        ],
    },
];

interface DocsSidebarProps {
    className?: string;
}

export default function DocsSidebar({ className }: DocsSidebarProps) {
    return <ReusableSidebar items={items} className={cn(className)} />;
}
