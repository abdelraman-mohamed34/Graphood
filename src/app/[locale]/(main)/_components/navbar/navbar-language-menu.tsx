"use client";

import { useRef, useState } from "react";
import { Check, Globe } from "lucide-react";
import { useLocaleSwitcher } from "./hooks/use-locale-switcher";
import { useClickOutside } from "./hooks/use-click-outside";

export default function LanguageMenu() {
    const [open, setOpen] = useState(false);

    const ref = useRef<HTMLDivElement>(null);

    const {
        locale,
        changeLocale,
    } = useLocaleSwitcher();

    useClickOutside(ref, () => setOpen(false));

    return (
        <div
            ref={ref}
            className="relative"
        >
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-gray-100 transition-colors px-1 h-10"
            >
                <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />

                <span className="capitalize">
                    {locale === "ar"
                        ? "العربية"
                        : "English"}
                </span>
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-40 rounded-lg border border-gray-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-lg overflow-hidden z-50">

                    <button
                        onClick={() => {
                            changeLocale("en");
                            setOpen(false);
                        }}
                        className="flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                    >
                        <span>English</span>

                        {locale === "en" && (
                            <Check className="w-4 h-4 text-blue-500" />
                        )}
                    </button>

                    <button
                        onClick={() => {
                            changeLocale("ar");
                            setOpen(false);
                        }}
                        className="flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                    >
                        <span>العربية</span>

                        {locale === "ar" && (
                            <Check className="w-4 h-4 text-blue-500" />
                        )}
                    </button>

                </div>
            )}
        </div>
    );
}