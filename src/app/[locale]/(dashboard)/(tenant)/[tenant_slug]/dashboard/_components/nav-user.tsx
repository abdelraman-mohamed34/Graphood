"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Link } from "@/i18n/navigation"
import { Profile } from "@/shared/lib/schemas/profiles.schema"
import { useLogin } from "@/shared/lib/supabase"
import { EllipsisVerticalIcon, CircleUserRoundIcon, CreditCardIcon, BellIcon, LogOutIcon } from "lucide-react"
import { useTranslations } from "next-intl"

type NavUserData = Profile | null | {
  name: string
  email: string
  avatar: string
}

export function NavUser({
  user,
}: {
  user: NavUserData
}) {
  const { isMobile } = useSidebar()
  const t = useTranslations("dashboard.sidebar")
  const isProfileUser = user !== null && typeof user === "object" && "first_name" in user && "last_name" in user
  const displayName = isProfileUser
    ? `${user.first_name} ${user.last_name}`.trim()
    : user?.name ?? t("guestUser")
  const displayEmail = isProfileUser
    ? user.email
    : user?.email ?? t("noEmail")
  const avatarUrl = isProfileUser ? user.avatar_url ?? undefined : user?.avatar
  const avatarAlt = displayName
  const initials = isProfileUser
    ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
    : t("guestInitials")

  const { signOut } = useLogin()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={avatarUrl} alt={avatarAlt} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {displayEmail}
                </span>
              </div>
              <EllipsisVerticalIcon className="ms-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <CircleUserRoundIcon
                />
                <Link href={'/settings/profile'}>
                  {t("account")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCardIcon
                />
                {t("billing")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon
                />
                {t("notifications")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <DropdownMenuItem className="text-red-500">
              <LogOutIcon />
              <button onClick={() => signOut()}>
                {t("logout")}
              </button>
            </DropdownMenuItem>

          </DropdownMenuContent>

        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
