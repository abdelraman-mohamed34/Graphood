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
                    className="h-10 w-full rounded-sm border border-border bg-white ps-10 pe-4 text-sm text-neutral-700 transition-colors placeholder:text-neutral-400 focus:border-teal focus:outline-none"
                />
            </div>
        </div>
    );
}
