"use client";

import { Menu } from "lucide-react";
import NavbarLogo from "./navbar-logo";
import NavbarSearch from "./navbar-search-Input";
import Notifications from "./navbar-notifications";
import LanguageMenu from "./navbar-language-menu";
import UserMenu from "./navbar-user-menu";


export default function Navbar() {
    return (
        <header
            className="w-full h-13 px-6 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors"
        >
            <div className="flex items-center gap-4">
                <button className="p-1 text-muted-foreground hover:text-foreground transition-colors hidden">
                    <Menu className="w-5 h-5" />
                </button>
                <NavbarLogo />
            </div>
            <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                <Notifications />
                <div className="mx-4 h-5 w-px bg-gray-200 dark:bg-zinc-700" />
                <LanguageMenu />
                <div className="mx-4 h-5 w-px bg-gray-200 dark:bg-zinc-700" />
                <UserMenu />
            </div>
        </header>
    );
}