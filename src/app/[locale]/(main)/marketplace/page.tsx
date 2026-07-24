// src/app/[locale]/(main)/marketplace/page.tsx
'use client'

import { useState } from "react";
import Image from "next/image";
import { Dir } from "@/shared/_components/dirs";
import { useSystem } from "@/shared/lib/hooks/systems/use-system";
import Loading from "../_components/test/loading";
import { Card } from "@/components/ui/card";
import NavbarSearch from "../_components/navbar/navbar-search-Input";
import { Link } from "@/i18n/navigation";

export default function Page() {
    const { systems = [], isLoading, error } = useSystem();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredSystems = systems.filter((sub) =>
        sub.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen text-red-500">
                <p>Failed to load systems.</p>
            </div>
        );
    }

    return (
        <>
            <Dir />

            {/* Navbar & Search Filter */}
            <div className="flex justify-center py-3">
                <NavbarSearch
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                />
            </div>

            {isLoading ? (
                <Loading />
            ) : filteredSystems.length === 0 ? (
                <div className="flex flex-col items-center pt-20 text-neutral-400 min-h-[70vh]">
                    <p>No systems found.</p>
                </div>
            ) : (
                <div className="w-full flex justify-center">
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full min-h-[calc(100vh-120px)] gap-4 max-w-7xl">
                        {filteredSystems.map((sub) => (
                            <Link key={sub.id || sub.name} href={`/marketplace/systems/${sub.id}`}>
                                <Card
                                    className="rounded-lg cursor-pointer overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-shadow duration-200 flex flex-col justify-between pt-0 max-h-50"
                                >
                                    {/* Icon / Image */}
                                    <div className="relative w-full h-40 bg-neutral-900/80 flex items-center justify-center overflow-hidden">
                                        {sub.icon_url ? (
                                            <Image
                                                className="w-full h-full object-cover"
                                                src={sub.icon_url}
                                                alt={sub.name}
                                            />
                                        ) : (
                                            <span className="text-neutral-500 text-sm">No Icon</span>
                                        )}
                                    </div>

                                    {/* Title Section */}
                                    <div className="p-2 py-0 font-medium text-sm text-neutral-800 dark:text-neutral-200 truncate">
                                        {sub.name}
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}