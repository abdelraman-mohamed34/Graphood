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

export default function SystemSidebar() {
    const params = useParams();
    const systemId = params.system_id as string;

    const navItems: SidebarItem[] = [
        {
            label: "Overview",
            href: `/developer/system/${systemId}`,
            icon: LayoutDashboard,
        },
        {
            label: "API Keys",
            href: `/developer/system/${systemId}/api-keys`,
            icon: KeyRound,
        },
        {
            label: "Coupons",
            href: `/developer/system/${systemId}/coupons`,
            icon: TicketPercent,
        },
        {
            label: "Orders",
            href: `/developer/system/${systemId}/orders`,
            icon: Receipt,
        },
        {
            label: "Pricing",
            href: `/developer/system/${systemId}/pricing`,
            icon: CreditCard,
        },
        {
            label: "Settings",
            href: `/developer/system/${systemId}/settings`,
            icon: Settings,
        },
    ];

    return <ReusableSidebar items={navItems} />;
}