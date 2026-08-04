"use client";

import { Link } from "@/i18n/navigation";
import { Boxes } from "lucide-react";

export default function NavbarLogo() {
    return (
        <Link
            href="/"
            className="flex shrink-0 items-center gap-2 whitespace-nowrap md:gap-2.5"
            aria-label="Graphood"
        >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground md:size-9">
                <Boxes className="size-4 md:size-5" aria-hidden="true" />
            </span>

            <span className="whitespace-nowrap text-base font-bold leading-none text-gray-900 dark:text-white sm:text-lg">
                Graphood
            </span>
        </Link>
    );
}
