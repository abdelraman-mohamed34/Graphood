import type { Metadata } from "next";

export const SUPPORTED_LOCALES = ["ar", "en"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const SITE_NAME = "Graphood";
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://www.graphood.com").replace(/\/+$/, "");
export const DEFAULT_OG_IMAGE = "/og.png";

export function isAppLocale(locale: string): locale is AppLocale {
    return SUPPORTED_LOCALES.includes(locale as AppLocale);
}

export function cleanPath(path = ""): string {
    const pathname = path.split(/[?#]/, 1)[0].replace(/\/{2,}/g, "/");
    if (!pathname || pathname === "/") return "";
    return `/${pathname.replace(/^\/+|\/+$/g, "")}`;
}

export function localizedPath(locale: AppLocale, path = ""): string {
    return `/${locale}${cleanPath(path)}`;
}

export function absoluteUrl(locale: AppLocale, path = ""): string {
    return `${SITE_URL}${localizedPath(locale, path)}`;
}

export function localizedAlternates(locale: AppLocale, path = ""): Metadata["alternates"] {
    return {
        canonical: absoluteUrl(locale, path),
        languages: {
            ar: absoluteUrl("ar", path),
            en: absoluteUrl("en", path),
            "x-default": absoluteUrl("en", path),
        },
    };
}

type PublicMetadataInput = {
    locale: AppLocale;
    path?: string;
    title: string;
    description: string;
    image?: string | null;
    type?: "website" | "article";
};

export function publicMetadata({ locale, path = "", title, description, image, type = "website" }: PublicMetadataInput): Metadata {
    const url = absoluteUrl(locale, path);
    const socialImage = image || DEFAULT_OG_IMAGE;
    return {
        title,
        description,
        alternates: localizedAlternates(locale, path),
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-image-preview": "large",
                "max-snippet": -1,
                "max-video-preview": -1,
            },
        },
        openGraph: {
            title,
            description,
            url,
            siteName: SITE_NAME,
            locale: locale === "ar" ? "ar_EG" : "en_US",
            alternateLocale: locale === "ar" ? ["en_US"] : ["ar_EG"],
            type,
            images: [{ url: socialImage, width: 1200, height: 630, alt: title }],
        },
        twitter: { card: "summary_large_image", title, description, images: [socialImage] },
    };
}

export const privateMetadata: Metadata = {
    robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};
