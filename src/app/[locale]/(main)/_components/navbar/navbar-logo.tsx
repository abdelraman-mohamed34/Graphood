"use client";

import { Link } from "@/i18n/navigation";
import { Boxes } from "lucide-react";
import Image from "next/image";

export default function NavbarLogo() {
    return (
        <Link
            href="/"
            className="flex shrink-0 items-center gap-2 whitespace-nowrap md:gap-2.5"
            aria-label="Graphood"
        >
            <Image
                src="/logo-oklch-0.25-0.05.png"
                alt="Graphood Logo"
                width={30}
                height={30}
                className="size-full object-contain"
            />

            <span className="whitespace-nowrap text-base font-bold leading-none text-maroon sm:text-lg">
                Graphood
            </span>
        </Link>
    );
}
