"use client";

import { useTranslations } from "next-intl";
import { Search, Mail, HelpCircle } from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HelpPage() {
    const t = useTranslations("help");

    return (
        <div className="container max-w-4xl py-8 space-y-8">
            {/* Header */}
            <div className="space-y-3 text-center sm:text-start">
                <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground">{t("subtitle")}</p>
            </div>

            {/* Quick Search */}
            <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={t("searchPlaceholder")}
                    className="ps-10"
                />
            </div>

            {/* FAQ Accordion */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    {t("faqTitle")}
                </h2>

                <Accordion.Root type="single" collapsible className="w-full">
                    <Accordion.Item value="item-1">
                        <Accordion.Trigger>{t("faqs.q1")}</Accordion.Trigger>
                        <Accordion.Content>{t("faqs.a1")}</Accordion.Content>
                    </Accordion.Item>

                    <Accordion.Item value="item-2">
                        <Accordion.Trigger>{t("faqs.q2")}</Accordion.Trigger>
                        <Accordion.Content>{t("faqs.a2")}</Accordion.Content>
                    </Accordion.Item>

                    <Accordion.Item value="item-3">
                        <Accordion.Trigger>{t("faqs.q3")}</Accordion.Trigger>
                        <Accordion.Content>{t("faqs.a3")}</Accordion.Content>
                    </Accordion.Item>
                </Accordion.Root>
            </div>

            {/* Contact Support Box */}
            <div className="p-6 border rounded-xl bg-card flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{t("contactSupport")}</h3>
                    <p className="text-sm text-muted-foreground">{t("contactDescription")}</p>
                </div>
                <Button asChild className="gap-2">
                    <a href="mailto:support@graphood.com">
                        <Mail className="h-4 w-4" />
                        {t("sendEmail")}
                    </a>
                </Button>
            </div>
        </div>
    );
}