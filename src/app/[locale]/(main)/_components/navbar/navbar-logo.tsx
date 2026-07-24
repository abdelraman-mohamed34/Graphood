"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";

export default function NavbarLogo() {
    return (
        <Link
            href="/"
            className="flex items-center gap-3 shrink-0"
        >
            <Image
                src="/logo.svg"
                alt="Graphood"
                width={36}
                height={36}
                priority
            />

            <span className="text-lg font-bold text-gray-900 dark:text-white">
                Graphood
            </span>
        </Link>
    );
}