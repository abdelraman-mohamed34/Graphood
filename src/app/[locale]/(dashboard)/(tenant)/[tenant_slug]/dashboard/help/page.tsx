"use client";

import { useTranslations } from "next-intl";
import { Search, Mail, HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

import { SiteHeader } from "../_components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import DashboardContainer from "@/shared/_components/dashboard-container";

export default function HelpPage() {
    const t = useTranslations("help");

    return (
        <SidebarInset>
            <SiteHeader title={t('title')} />
            <DashboardContainer className="space-y-6">
                <div className="max-w-4xl mx-auto py-6 space-y-8">

                    {/* Header */}
                    <div className="space-y-2 text-start">
                        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                        <p className="text-muted-foreground">{t("subtitle")}</p>
                    </div>

                    {/* Quick Search */}
                    <div className="relative">
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t("searchPlaceholder")}
                            className="ps-10 h-11 bg-background"
                        />
                    </div>

                    {/* FAQ Accordion */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <HelpCircle className="h-5 w-5 text-primary" />
                            {t("faqTitle")}
                        </h2>

                        <Accordion type="single" collapsible className="w-full space-y-3">
                            <AccordionItem value="item-1" className="border rounded-xl px-4 bg-card shadow-sm">
                                <AccordionTrigger className="hover:no-underline font-medium text-start py-4">
                                    {t("faqs.q1")}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground text-sm pb-4 pt-0">
                                    {t("faqs.a1")}
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-2" className="border rounded-xl px-4 bg-card shadow-sm">
                                <AccordionTrigger className="hover:no-underline font-medium text-start py-4">
                                    {t("faqs.q2")}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground text-sm pb-4 pt-0">
                                    {t("faqs.a2")}
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-3" className="border rounded-xl px-4 bg-card shadow-sm">
                                <AccordionTrigger className="hover:no-underline font-medium text-start py-4">
                                    {t("faqs.q3")}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground text-sm pb-4 pt-0">
                                    {t("faqs.a3")}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    {/* Contact Support Box */}
                    <div className="p-6 border rounded-2xl bg-card shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="space-y-1 text-start">
                            <h3 className="font-semibold text-lg">{t("contactSupport")}</h3>
                            <p className="text-sm text-muted-foreground">{t("contactDescription")}</p>
                        </div>
                        <Button asChild className="gap-2 shrink-0">
                            <a href="mailto:support@graphood.com">
                                <Mail className="h-4 w-4" />
                                {t("sendEmail")}
                            </a>
                        </Button>
                    </div>

                </div>
            </DashboardContainer>
        </SidebarInset>
    );
}
