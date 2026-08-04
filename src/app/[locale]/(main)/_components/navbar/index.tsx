"use client";

import { Menu } from "lucide-react";
import NavbarLogo from "./navbar-logo";
import LanguageMenu from "./navbar-language-menu";
import UserMenu from "./navbar-user-menu";
import { useSystemNavigation } from "@/shared/_components/system-navigation-provider";
import { useTranslations } from "next-intl";


export default function Navbar() {
    const systemNavigation = useSystemNavigation();
    const t = useTranslations("systemSidebar");

    return (
        <header
            className="flex h-14 w-full items-center justify-between gap-3 border-b border-gray-100 bg-white px-4 transition-colors dark:border-zinc-800 dark:bg-zinc-900 md:px-6"
        >
            <div className="flex min-w-0 items-center gap-2 md:gap-3">
                {systemNavigation && (
                    <button
                        type="button"
                        onClick={systemNavigation.toggle}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/20 md:hidden"
                        aria-label={t("open_navigation")}
                        aria-expanded={systemNavigation.open}
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                )}
                <NavbarLogo />
            </div>
            <div className="flex shrink-0 items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 md:gap-3">
                <LanguageMenu />
                <div className="h-5 w-px shrink-0 bg-gray-200 dark:bg-zinc-700" />
                <UserMenu />
            </div>
        </header>
    );
}
