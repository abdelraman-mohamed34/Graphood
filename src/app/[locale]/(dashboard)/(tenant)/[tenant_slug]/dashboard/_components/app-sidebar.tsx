"use client"

import * as React from "react"
import {
    IconDatabase,
    IconFileWord,
    IconHelp,
    IconInnerShadowTop,
    IconListDetails,
    IconPill,
    IconReport,
    IconSettings,
    IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "./nav-documents"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/shared/lib/auth/auth-context"
import { NavMain } from "./nav-main"
import { Link } from "@/i18n/navigation"
import brandConfig from "../../../../../../../../public/data.json"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

    const { user } = useAuth()
    const t = useTranslations("dashboard.sidebar")
    const { tenant_slug: tenantSlug } = useParams<{ tenant_slug: string }>()
    const navMain = [
        { title: t("quickview"), url: "quickview", icon: IconListDetails },
        { title: t("subscription"), url: "subscription", icon: IconPill },
        { title: t("members"), url: "members", icon: IconUsers },
        { title: t("settings"), url: "settings", icon: IconSettings },
    ]
    const navSecondary = [
        { title: t("settings"), url: "/settings/profile", icon: IconSettings },
        { title: t("getHelp"), url: "#", icon: IconHelp },
    ]

    const documents = [
        { name: t("dataLibrary"), url: "#", icon: IconDatabase },
        { name: t("reports"), url: "#", icon: IconReport },
        { name: t("wordAssistant"), url: "#", icon: IconFileWord },
    ]

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="cursor-pointer data-[slot=sidebar-menu-button]:p-1.5! hover:bg-transparent! hover:text-sidebar-foreground! active:bg-transparent!"
                        >
                            <Link href={`/${tenantSlug}/dashboard/quickview`}>
                                <IconInnerShadowTop className="size-5!" />
                                <span className="text-base font-semibold">{brandConfig.brand}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navMain} />
                {/* <NavDocuments items={documents} /> */}
                <NavSecondary items={navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
        </Sidebar>
    )
}
