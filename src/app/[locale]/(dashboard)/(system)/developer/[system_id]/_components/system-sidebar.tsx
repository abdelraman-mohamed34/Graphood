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

import { Link } from "@/i18n/navigation";

export default function SystemSidebar() {
    const params = useParams();
    const systemId = params.system_id as string;

    const items = [
        {
            label: "Overview",
            href: `/developer/${systemId}`,
            icon: LayoutDashboard,
        },
        {
            label: "API Keys",
            href: `/developer/${systemId}/api-keys`,
            icon: KeyRound,
        },
        {
            label: "Coupons",
            href: `/developer/${systemId}/coupons`,
            icon: TicketPercent,
        },
        {
            label: "Orders",
            href: `/developer/${systemId}/orders`,
            icon: Receipt,
        },
        {
            label: "Pricing",
            href: `/developer/${systemId}/pricing`,
            icon: CreditCard,
        },
        {
            label: "Settings",
            href: `/developer/${systemId}/settings`,
            icon: Settings,
        },
    ];

    return (
        <aside className="w-64 h-screen p-2 shrink-0 border-r border-border">
            <nav>
                <ul className="space-y-1">
                    {items.map((item) => {
                        const Icon = item.icon;

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
}