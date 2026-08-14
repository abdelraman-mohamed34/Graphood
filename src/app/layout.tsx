import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/shared/lib/seo";

import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import "@fontsource/roboto-mono/400.css";
import "@fontsource/roboto-mono/500.css";
import "@fontsource/roboto-mono/700.css";

import "@fontsource/cairo/400.css";
import "@fontsource/cairo/600.css";
import "@fontsource/cairo/700.css";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
    description: "A modular marketplace and multi-system SaaS platform.",
    applicationName: SITE_NAME,
    manifest: "/manifest.webmanifest",
    icons: {
        icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/icon.svg", type: "image/svg+xml" }],
        apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    openGraph: { siteName: SITE_NAME, type: "website", images: [DEFAULT_OG_IMAGE] },
    twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE] },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: "#0d0407",
    colorScheme: "dark light",
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const requestHeaders = await headers();
    const locale = requestHeaders.get("x-graphood-locale") === "ar" ? "ar" : "en";
    return (
        <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fvmfqtplyzfxuhiqgklm.supabase.co" crossOrigin="anonymous" />
                <link rel="dns-prefetch" href="https://fvmfqtplyzfxuhiqgklm.supabase.co" />
                <link rel="preload" href="/icon.svg" as="image" type="image/svg+xml" />
            </head>
            <body className="antialiased font-sans">
                {children}
            </body>
        </html>
    );
}
