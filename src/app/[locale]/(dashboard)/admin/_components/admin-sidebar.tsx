"use client";

import { FileText, Server, Users } from "lucide-react";

import { ReusableSidebar, type SidebarGroup } from "@/shared/_components/reusable_sidebar";
import { cn } from "@/lib/utils";
import { usePlatformStaff } from "@/shared/lib/hooks/admins/use-platform-staff";
import { useTranslations } from "next-intl";
import { useAuditLogUnreadCount } from "@/shared/lib/hooks/audit_logs/use-audit-log-unread-count";

interface AdminSidebarProps {
    className?: string;
    onNavigate?: () => void;
}

export default function AdminSidebar({ className, onNavigate }: AdminSidebarProps) {
    const { isSuperAdmin } = usePlatformStaff();
    const t = useTranslations("adminSidebar");
    const { unreadCount } = useAuditLogUnreadCount();

    const items: SidebarGroup[] = [
        {
            title: t("groups.platformManagement"),
            items: [
                {
                    label: t("items.systemsOrders"),
                    href: "/admin/systems",
                    icon: Server,
                },
                ...(isSuperAdmin
                    ? [
                        {
                            label: t("items.staff"),
                            href: "/admin/staff",
                            icon: Users,
                        },
                    ]
                    : []),
                {
                    label: t("items.audit_logs"),
                    href: "/admin/logs",
                    icon: FileText,
                    badge: unreadCount > 0 ? (unreadCount > 99 ? "99+" : unreadCount) : undefined,
                    badgeVariant: "destructive" as const,
                }
            ],
        },
    ];

    return (
        <ReusableSidebar
            items={items}
            className={cn(className)}
            onNavigate={onNavigate}
        />
    );
}
