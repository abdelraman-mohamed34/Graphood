"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export interface SidebarItem {
    label: string;
    href: string;
    icon: LucideIcon;
    badge?: string | number;
    exact?: boolean;
}

export interface SidebarGroup {
    title?: string;
    items: SidebarItem[];
}

export interface ReusableSidebarProps
    extends React.HTMLAttributes<HTMLElement> {
    items: SidebarGroup[];
    header?: React.ReactNode;
    footer?: React.ReactNode;
}

export function ReusableSidebar({
    items,
    header,
    footer,
    className,
    ...props
}: ReusableSidebarProps) {
    const rawPathname = usePathname();

    const normalizedPathname = rawPathname.replace(/^\/(ar|en)/, "") || "/";

    const isItemActive = (href: string, exact?: boolean) => {
        const targetHref = href.startsWith("/") ? href : `/${href}`;

        if (exact || targetHref === "/") {
            return normalizedPathname === targetHref;
        }

        return (
            normalizedPathname === targetHref ||
            normalizedPathname.startsWith(`${targetHref}/`)
        );
    };

    if (!items.length) return null;

    return (
        <aside
            className={cn(
                "sticky top-[113px] hidden h-[calc(100vh-7.1rem)] w-64 shrink-0 flex-col border-r border-border bg-background p-2 pt-4 md:flex",
                className
            )}
            {...props}
        >
            {header && (
                <div className="mb-2 border-b border-border px-3 py-2">
                    {header}
                </div>
            )}

            <nav
                aria-label="Sidebar Navigation"
                className="flex-1 overflow-y-auto"
            >
                <div className="space-y-6">
                    {items.map((group, index) => (
                        <div key={group.title ?? index}>
                            {group.title && (
                                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {group.title}
                                </p>
                            )}

                            <ul className="space-y-1">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    const active = isItemActive(
                                        item.href,
                                        item.exact
                                    );

                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                aria-current={
                                                    active ? "page" : undefined
                                                }
                                                className={cn(
                                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                                                    active
                                                        ? "bg-muted font-semibold text-primary"
                                                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                                                )}
                                            >
                                                <Icon className="h-4 w-4 shrink-0" />

                                                <span className="flex-1 truncate">
                                                    {item.label}
                                                </span>

                                                {item.badge != null && (
                                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            </nav>

            {footer && (
                <div className="mt-3 border-t border-border pt-3">
                    {footer}
                </div>
            )}
        </aside>
    );
}