"use client"

import * as React from "react"
import {
    IconCamera,
    IconDatabase,
    IconFileAi,
    IconFileDescription,
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

// mock data
const data = {
    user: {
        name: "shad",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Quick view",
            url: "quickview",
            icon: IconListDetails,
        },
        {
            title: "subscription",
            url: "subscription",
            icon: IconPill,
        },
        {
            title: "Members",
            url: "members",
            icon: IconUsers,
        },
        {
            title: "Settings",
            url: "settings",
            icon: IconSettings,
        }
    ],
    navClouds: [
        {
            title: "Capture",
            icon: IconCamera,
            isActive: true,
            url: "#",
            items: [
                {
                    title: "Active Proposals",
                    url: "#",
                },
                {
                    title: "Archived",
                    url: "/members",
                },
            ],
        },
        {
            title: "Proposal",
            icon: IconFileDescription,
            url: "#",
            items: [
                {
                    title: "Active Proposals",
                    url: "#",
                },
                {
                    title: "Archived",
                    url: "#",
                },
            ],
        },
        {
            title: "Prompts",
            icon: IconFileAi,
            url: "#",
            items: [
                {
                    title: "Active Proposals",
                    url: "#",
                },
                {
                    title: "Archived",
                    url: "#",
                },
            ],
        },
    ],
    navSecondary: [
        {
            title: "Settings",
            url: "/settings/profile",
            icon: IconSettings,
        },
        {
            title: "Get Help",
            url: "#",
            icon: IconHelp,
        }
    ],
    documents: [
        {
            name: "Data Library",
            url: "#",
            icon: IconDatabase,
        },
        {
            name: "Reports",
            url: "#",
            icon: IconReport,
        },
        {
            name: "Word Assistant",
            url: "#",
            icon: IconFileWord,
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

    const { user } = useAuth()

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:p-1.5!"
                        >
                            <Link href="#">
                                <IconInnerShadowTop className="size-5!" />
                                <span className="text-base font-semibold">{brandConfig.brand}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavDocuments items={data.documents} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
        </Sidebar>
    )
}
