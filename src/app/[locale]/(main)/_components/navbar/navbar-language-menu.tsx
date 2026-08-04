"use client";

import { Check, Globe } from "lucide-react";
import { useLocaleSwitcher } from "./hooks/use-locale-switcher";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LanguageMenu() {
    const { locale, changeLocale } = useLocaleSwitcher();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-gray-100 transition-colors px-1 h-10 outline-none cursor-pointer">
                    <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="capitalize text-sm font-medium">
                        {locale === "ar" ? "العربية" : "English"}
                    </span>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                side="bottom"
                sideOffset={6}
                className="w-36 min-w-[9rem]"
            >
                <DropdownMenuItem
                    onClick={() => changeLocale("en")}
                    className="flex items-center justify-between cursor-pointer"
                >
                    <span>English</span>
                    {locale === "en" && <Check className="w-4 h-4 text-blue-500" />}
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => changeLocale("ar")}
                    className="flex items-center justify-between cursor-pointer"
                >
                    <span>العربية</span>
                    {locale === "ar" && <Check className="w-4 h-4 text-blue-500" />}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}