import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import FAQ from "../../(home)/home/_components/faq";
import { JsonLd } from "@/shared/_components/json-ld";
import { isAppLocale, publicMetadata } from "@/shared/lib/seo";

const keys = ["platform", "outwin", "subdomains", "developers", "trial"] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    if (!isAppLocale(locale)) return {};
    const t = await getTranslations({ locale, namespace: "seo.faq" });
    return publicMetadata({ locale, path: "/faq", title: t("title"), description: t("description") });
}

export default async function FAQPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "home.landing.faq" });
    return <main className="min-h-screen bg-[#f4f3f1]"><h1 className="sr-only">{t("title")}</h1><JsonLd data={{
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: keys.map((key) => ({ "@type": "Question", name: t(`items.${key}.question`), acceptedAnswer: { "@type": "Answer", text: t(`items.${key}.answer`) } })),
    }} /><FAQ /></main>;
}
