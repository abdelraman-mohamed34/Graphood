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
    const { locale, changeLocale, isChangingLocale } = useLocaleSwitcher();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-md px-1.5 outline-none transition-colors hover:bg-muted hover:text-gray-900 focus-visible:ring-1 focus-visible:ring-primary/20 dark:hover:text-gray-100">
                    <Globe className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" />
                    <span className="hidden whitespace-nowrap text-sm font-medium sm:inline">
                        {locale === "ar" ? "العربية" : "English"}
                    </span>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align={locale === "ar" ? "start" : "end"}
                side="bottom"
                sideOffset={6}
                className="w-36 min-w-[9rem] rounded shadow-sm max-sm:duration-0 max-sm:data-open:animate-none max-sm:data-closed:animate-none"
            >
                <DropdownMenuItem
                    onClick={() => changeLocale("en")}
                    disabled={isChangingLocale}
                    className="flex items-center justify-between cursor-pointer"
                >
                    <span>English</span>
                    {locale === "en" && <Check className="w-4 h-4 text-primary" />}
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => changeLocale("ar")}
                    disabled={isChangingLocale}
                    className="flex items-center justify-between cursor-pointer"
                >
                    <span>العربية</span>
                    {locale === "ar" && <Check className="w-4 h-4 text-primary" />}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
