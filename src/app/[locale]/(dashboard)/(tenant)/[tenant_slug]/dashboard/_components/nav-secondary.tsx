"use client"

import * as React from "react"
import { useParams, useRouter, usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: React.ReactNode | React.ElementType<{ className?: string }>
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const icon = item.icon

            const handleNavigation = () => {
              if (item.url.startsWith("/")) {
                router.push(item.url)
              } else {
                const dashboardIndex = pathname.indexOf("/dashboard")
                if (dashboardIndex !== -1) {
                  const basePath = pathname.substring(0, dashboardIndex + 10)
                  router.push(`${basePath}/${item.url}`)
                } else {
                  const tenantSlug = params?.tenant_slug as string
                  router.push(tenantSlug ? `/${tenantSlug}/dashboard/${item.url}` : `/dashboard/${item.url}`)
                }
              }
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton onClick={handleNavigation}>
                  {React.isValidElement(icon)
                    ? icon
                    : React.createElement(icon as React.ElementType, { className: "w-4 h-4 shrink-0" })}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}