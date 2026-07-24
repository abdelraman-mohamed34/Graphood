"use client";

import React, { ChangeEvent } from "react";
import { Search } from "lucide-react";

interface NavbarSearchProps {
    value?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}

export default function NavbarSearch({
    value,
    onChange,
    placeholder = "Search for Coin, Function, Announcement...",
}: NavbarSearchProps) {
    return (
        <div className="flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-4 h-4 text-gray-400" />
                </span>

                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
            </div>
        </div>
    );
}