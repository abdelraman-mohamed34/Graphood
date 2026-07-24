"use client";

import { Bell } from "lucide-react";

interface NotificationBellProps {
    count?: number;
}

export default function Notifications({
    count = 21,
}: NotificationBellProps) {
    return (
        <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">

            <Bell className="w-5 h-5" />

            {count > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {count}
                </span>
            )}

        </button>
    );
}