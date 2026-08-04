"use client";

import Image from "next/image";
import { User, Settings, LogOut, Network } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { useAuth } from "@/shared/lib/auth/auth-context";
import { useLogin } from "@/shared/lib/supabase";

import { useRef, useState } from "react";
import { useClickOutside } from "./hooks/use-click-outside";
import { useLocale } from "next-intl";
import { useProfile } from "@/shared/lib/hooks/profile/use-profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserMenu() {
    const { user, isLoading } = useAuth();
    const { signOut } = useLogin();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useClickOutside(ref, () => setOpen(false));

    const locale = useLocale();

    const { profile, } = useProfile(locale);

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
                Login
            </Link>
        );
    }

    return (
        <div
            ref={ref}
            className="relative"
        >
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center justify-center"
            >
                <Avatar className="h-8 w-8 border border-gray-100 dark:border-zinc-800">
                    <AvatarImage
                        src={profile?.avatarUrl ?? undefined}
                        alt={`${user.first_name} ${user.last_name}`}
                        className="object-cover"
                    />

                    <AvatarFallback className="bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400">
                        <User className="h-4 w-4" />
                    </AvatarFallback>
                </Avatar>
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="border-b border-gray-100 px-4 py-3 dark:border-zinc-700">
                        <p className="text-xs text-gray-400">
                            Signed in as
                        </p>

                        <p className="truncate font-semibold">
                            {user.first_name} {user.last_name}
                        </p>

                        <p className="truncate text-xs text-gray-400">
                            {user.email}
                        </p>
                    </div>

                    <Link
                        href="/workspaces"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-zinc-700"
                    >
                        <Network className="h-4 w-4 text-gray-400" />
                        <span>work space</span>
                    </Link>

                    <Link
                        href="/settings"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-zinc-700"
                    >
                        <Settings className="h-4 w-4 text-gray-400" />

                        <span>Settings</span>
                    </Link>

                    <div className="my-1 border-t border-gray-100 dark:border-zinc-700" />

                    <button
                        onClick={() => {
                            setOpen(false);
                            signOut();
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                        <LogOut className="h-4 w-4" />

                        <span>Logout</span>
                    </button>

                </div>
            )}
        </div>
    );
}