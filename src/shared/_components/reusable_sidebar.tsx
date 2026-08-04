"use client";

import React from "react";
import { type LucideIcon } from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";
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
    items: SidebarItem[] | SidebarGroup[];
    header?: React.ReactNode;
    footer?: React.ReactNode;
    onNavigate?: () => void;
}

export function ReusableSidebar({
    items,
    header,
    footer,
    onNavigate,
    className,
    ...props
}: ReusableSidebarProps) {
    const pathname = usePathname();

    const isItemActive = (href: string, exact?: boolean) => {
        const targetHref = href.startsWith("/") ? href : `/${href}`;

        if (exact || targetHref === "/") {
            return pathname === targetHref;
        }

        return (
            pathname === targetHref ||
            pathname.startsWith(`${targetHref}/`)
        );
    };

    if (!items.length) return null;

    const groups: SidebarGroup[] =
        "items" in items[0]
            ? (items as SidebarGroup[])
            : [
                {
                    items: items as SidebarItem[],
                },
            ];

    return (
        <aside
            className={cn(
                "sticky top-[113px] hidden h-[calc(100vh-7.1rem)] w-64 shrink-0 flex-col border-e border-border bg-background p-2 pt-4 text-start md:flex",
                className
            )}
            {...props}
        >
            {header && (
                <div className="mb-2 border-b border-border ps-3 pe-3 py-2 text-start">
                    {header}
                </div>
            )}

            <nav
                aria-label="Sidebar Navigation"
                className="flex-1 overflow-y-auto"
            >
                <div className="space-y-6">
                    {groups.map((group, index) => (
                        <div key={group.title ?? index}>
                            {group.title && (
                                <p className="mb-2 ps-3 pe-3 text-start text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                                                onClick={onNavigate}
                                                aria-current={
                                                    active
                                                        ? "page"
                                                        : undefined
                                                }
                                                className={cn(
                                                    "flex select-none items-center gap-3 rounded-lg border-none ps-3 pe-3 py-2 text-start text-sm outline-none transition-all focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20",
                                                    active
                                                        ? "bg-muted font-semibold text-foreground"
                                                        : "font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground"
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
