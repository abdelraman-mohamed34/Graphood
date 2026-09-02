"use client";

import Image from "next/image";

import { Link } from "@/i18n/navigation";
import { IconBrandInstagram } from "@tabler/icons-react";
import { Mail, MessageCircle } from "lucide-react";

export interface SocialLink {
    label: string;
    href: string;
    icon: "instagram" | "whatsapp" | "gmail";
}

interface FooterBrandProps {
    description: string;
}

const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
    {
        label: "Instagram",
        href: "https://instagram.com/graphoodhq",
        icon: "instagram",
    },
    {
        label: "WhatsApp",
        href: "https://wa.me/201021079171",
        icon: "whatsapp",
    },
    {
        label: "Gmail",
        href: "https://mail.google.com/mail/?view=cm&fs=1&to=contact@graphood.com",
        icon: "gmail",
    },
];

function SocialIcon({ icon }: { icon: SocialLink["icon"] }) {
    if (icon === "instagram") {
        return <IconBrandInstagram className="size-4" />;
    }

    if (icon === "whatsapp") {
        return <MessageCircle className="size-4" />;
    }

    return <Mail className="size-4" />;
}

export function FooterBrand({ description }: FooterBrandProps) {
    return (
        <div className="space-y-5">
            <Link href="/" className="inline-flex items-center gap-3" aria-label="Graphood home">
                <Image src="/icon.png" alt="" width={40} height={40} className="size-6 object-cover" />
                <span className="text-xl font-bold tracking-tight text-white">Graphood</span>
            </Link>

            <p className="max-w-sm text-sm leading-6 text-white/60">
                {description}
            </p>

            <div className="flex items-center gap-2">
                {DEFAULT_SOCIAL_LINKS.map((item) => (
                    <a
                        key={item.href}
                        href={item.href}
                        target={item.icon === "gmail" ? "_self" : "_blank"}
                        rel="noreferrer"
                        aria-label={item.label}
                        className="inline-flex size-9 items-center justify-center rounded-md border border-white/15 text-white/60 transition-colors hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                    >
                        <SocialIcon icon={item.icon} />
                    </a>
                ))}
            </div>
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