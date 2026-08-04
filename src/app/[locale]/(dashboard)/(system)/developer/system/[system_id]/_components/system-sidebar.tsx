"use client";

import { useParams } from "next/navigation";
import {
    LayoutDashboard,
    KeyRound,
    TicketPercent,
    Receipt,
    CreditCard,
    Settings,
} from "lucide-react";
import { ReusableSidebar, SidebarItem } from "@/shared/_components/reusable_sidebar";
import { useTranslations } from "next-intl";

export default function SystemSidebar() {
    const params = useParams();
    const systemId = params.system_id as string;
    const t = useTranslations("systemSidebar");

    const navItems: SidebarItem[] = [
        {
            label: t("overview"),
            href: `/developer/system/${systemId}`,
            icon: LayoutDashboard,
            exact: true,
        },
        {
            label: t("api_keys"),
            href: `/developer/system/${systemId}/api-keys`,
            icon: KeyRound,
        },
        {
            label: t("coupons"),
            href: `/developer/system/${systemId}/coupons`,
            icon: TicketPercent,
        },
        {
            label: t("orders"),
            href: `/developer/system/${systemId}/orders`,
            icon: Receipt,
        },
        {
            label: t("pricing"),
            href: `/developer/system/${systemId}/pricing`,
            icon: CreditCard,
        },
        {
            label: t("settings"),
            href: `/developer/system/${systemId}/settings`,
            icon: Settings,
        },
    ];

    return <ReusableSidebar items={navItems} />;
}
