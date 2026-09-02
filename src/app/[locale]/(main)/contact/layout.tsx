import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { isAppLocale, publicMetadata } from "@/shared/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    if (!isAppLocale(locale)) return {};
    const t = await getTranslations({ locale, namespace: "contactUs" });
    return publicMetadata({ locale, path: "/contact", title: t("title"), description: t("subtitle") });
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return children;
}
