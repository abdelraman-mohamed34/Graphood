"use client";

import Image from "next/image";

import { Link } from "@/i18n/navigation";

const GRAPHOOD_GITHUB_URL = "https://github.com/abdelraman-mohamed34/Graphood";

interface FooterBrandProps {
    description: string;
    githubLabel: string;
}

export function FooterBrand({ description, githubLabel }: FooterBrandProps) {
    return (
        <div className="space-y-5">
            <Link href="/" className="inline-flex items-center gap-3" aria-label="Graphood home">
                <Image src="/icon.svg" alt="" width={40} height={40} className="size-10 rounded-lg" />
                <span className="text-xl font-bold tracking-tight text-white">Graphood</span>
            </Link>

            <p className="max-w-sm text-sm leading-6 text-white/60">
                {description}
            </p>

            <a
                href={GRAPHOOD_GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                aria-label={githubLabel}
                className="inline-flex size-9 items-center justify-center rounded-md border border-white/15 text-white/60 transition-colors hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
                <svg className="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1 .07 1.523 1.485 1.523 1.485.89 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
            </a>
        </div>
    );
}

interface FooterColumnProps {
    title: string;
    links: Array<{ label: string; href: string }>;
}

export function FooterColumn({ title, links }: FooterColumnProps) {
    return (
        <nav aria-label={title} className="space-y-4">
            <h2 className="text-sm font-semibold text-white">
                {title}
            </h2>
            <ul className="space-y-3">
                {links.map((link) => (
                    <li key={`${link.href}-${link.label}`}>
                        <Link
                            href={link.href}
                            className="text-sm text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-4"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
