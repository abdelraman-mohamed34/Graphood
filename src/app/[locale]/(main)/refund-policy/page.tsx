import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Ban, CalendarClock, FlaskConical, Mail, ReceiptText, ShieldCheck } from "lucide-react";
import { isAppLocale, publicMetadata } from "@/shared/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    if (!isAppLocale(locale)) return {};
    const t = await getTranslations({ locale, namespace: "refundPolicy" });
    return publicMetadata({ locale, path: "/refund-policy", title: t("title"), description: t("subtitle") });
}

export default async function RefundPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations("refundPolicy");
    const sections = [
        { icon: FlaskConical, title: t("testModeTitle"), text: t("testModeClause"), badge: t("testModeBadge") },
        { icon: ReceiptText, title: t("oneTimeTitle"), text: t("oneTimePurchase"), badge: t("oneTimeBadge") },
        { icon: CalendarClock, title: t("monthlyTitle"), text: t("monthlySubscriptions"), badge: t("monthlyBadge") },
        { icon: Ban, title: t("exclusionsTitle"), text: t("exclusions"), badge: t("exclusionsBadge") },
        { icon: Mail, title: t("manualTitle"), text: t("manualProcessing"), badge: t("manualBadge") },
    ];
    return (
        <main dir={locale === "ar" ? "rtl" : "ltr"} className="mx-auto w-full text-start sm:pb-16">
            <section className="overflow-hidden">
                <div className="border-b border-border bg-maroon px-6 py-8 text-white sm:px-10">
                    <div className="sm:flex gap-3">
                        <span className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-white/10"><ShieldCheck className="size-5" /></span>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
                    </div>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">{t("subtitle")}</p>
                </div>
                <div className="flex justify-center">
                    <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6 max-w-4xl">
                        {sections.map(({ icon: Icon, title, text, badge }) => (
                            <article key={title} className="rounded-lg border border-border bg-background p-5 transition-colors hover:border-teal/60">
                                <div className="flex flex-col items-start gap-3">
                                    <div className="flex flex-row items-center gap-3 rtl:flex-row-reverse">
                                        <h2 className="font-semibold text-foreground">{title}</h2>
                                        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-teal/10 text-teal">
                                            <Icon className="size-4" />
                                        </span>
                                    </div>
                                    <span className="shrink-0 self-start rounded-full bg-teal/10 px-2.5 py-1 text-[11px] font-semibold text-teal">{badge}</span>
                                </div>
                                <p className="mt-4 text-sm leading-6 text-muted-foreground">{text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
