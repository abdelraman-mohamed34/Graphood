"use client";

import { User, Settings, LogOut, Network, PanelsTopLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Link } from "@/i18n/navigation";
import { useAuth } from "@/shared/lib/auth/auth-context";
import { useLogin } from "@/shared/lib/supabase";

import { useRef, useState } from "react";
import { useClickOutside } from "./hooks/use-click-outside";
import { useLocale, useTranslations } from "next-intl";
import { useProfile } from "@/shared/lib/hooks/profile/use-profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserMenu() {
    const t = useTranslations("header");
    const { user, isLoading } = useAuth();
    const { signOut } = useLogin();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useClickOutside(ref, () => setOpen(false));

    const locale = useLocale();
    const isRtl = locale === "ar";

    const { profile } = useProfile(locale);

    if (isLoading) {
        return (
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 animate-pulse" />
        );
    }

    if (!user) {
        return (
            <Link
                href="/login"
                className="px-2 font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
                {t("auth.login")}
            </Link>
        );
    }

    return (
        <div ref={ref} className="relative shrink-0">
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex shrink-0 cursor-pointer items-center justify-center rounded-full outline-none transition-transform active:scale-95 focus-visible:ring-1 focus-visible:ring-primary/20"
            >
                <Avatar className="h-8 w-8 border border-gray-100 dark:border-zinc-800">
                    <AvatarImage
                        src={
                            profile?.avatarUrl ??
                            profile?.avatar_url ??
                            user.avatar_url ??
                            undefined
                        }
                        alt={`${user.first_name} ${user.last_name}`}
                        className="object-cover"
                    />

                    <AvatarFallback className="bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400">
                        <User className="h-4 w-4" />
                    </AvatarFallback>
                </Avatar>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -6 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={`absolute end-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-800 ${isRtl ? "origin-top-left" : "origin-top-right"
                            }`}
                    >
                        <div className="border-b border-gray-100 px-4 py-3 dark:border-zinc-700">
                            <p className="truncate font-semibold text-sm mt-0.5">
                                {user.first_name} {user.last_name}
                            </p>

                            <p className="truncate text-xs text-gray-400">
                                {user.email}
                            </p>
                        </div>

                        <div className="p-1">
                            <Link
                                href="/workspaces"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-zinc-700/60"
                            >
                                <Network className="h-4 w-4 text-gray-400" />
                                <span>{t("userMenu.workspaces")}</span>
                            </Link>

                            <Link
                                href="/settings"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-zinc-700/60"
                            >
                                <Settings className="h-4 w-4 text-gray-400" />
                                <span>{t("userMenu.settings")}</span>
                            </Link>

                            <Link
                                href="/developer/systems"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-zinc-700/60"
                            >
                                <PanelsTopLeft className="h-4 w-4 text-gray-400" />
                                <span>{t("userMenu.developerSystems")}</span>
                            </Link>
                        </div>

                        <div className="my-1 border-t border-gray-100 dark:border-zinc-700" />

                        <div className="p-1">
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    signOut();
                                }}
                                className="flex w-full items-center gap-3 px-3 py-2 text-start text-sm text-red-500 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>{t("userMenu.logout")}</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
