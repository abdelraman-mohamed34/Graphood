"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Camera, CheckCircle2, Code2, ShieldCheck, Store } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { HatchedContainer } from "@/shared/_components/hatched-container";
import { Link } from "@/i18n/navigation";

const tabs = [
    { id: "studio", icon: Camera },
    { id: "ecommerce", icon: Store },
    { id: "security", icon: ShieldCheck },
    { id: "developer", icon: Code2 },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function EcosystemSuite() {
    const t = useTranslations("home.landing.ecosystem");
    const locale = useLocale();
    const [activeTab, setActiveTab] = useState<TabId>("studio");
    const currentTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

    return (
        <section className="mx-auto w-full bg-muted/80 px-6 py-10 text-neutral-900 select-none">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl md:text-5xl">
                    {t("title")}
                </h2>
                <Link
                    href="/marketplace"
                    className="self-start border border-neutral-300 bg-white px-5 py-2.5 text-xs font-semibold text-purple-700 shadow-sm transition-all hover:border-neutral-400 hover:bg-neutral-50 active:scale-95 sm:self-auto sm:text-sm"
                >
                    {t("cta")}
                </Link>
            </div>

            <div className="mb-6 flex w-full items-center justify-between overflow-x-auto border border-neutral-200/80 bg-white no-scrollbar">
                <div className="grid w-full grid-cols-2 md:grid-cols-4" role="tablist" aria-label={t("tabsLabel")}>
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={`ecosystem-panel-${tab.id}`}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative flex cursor-pointer items-center justify-center gap-2.5 px-4 py-4.5 text-xs font-semibold transition-all duration-300 sm:text-sm ${
                                    isActive
                                        ? "bg-[#ededed] text-neutral-900 shadow-sm"
                                        : "text-neutral-600 hover:bg-white/40 hover:text-neutral-900"
                                }`}
                            >
                                <Icon className={`size-4 ${isActive ? "text-purple-600" : "text-neutral-500"}`} aria-hidden="true" />
                                <span>{t(`tabs.${tab.id}.label`)}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <HatchedContainer sides="y">
                <div className="relative w-full overflow-hidden border border-neutral-200/80 bg-[#fbf9f5] p-6 sm:p-10 md:p-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentTab.id}
                            id={`ecosystem-panel-${currentTab.id}`}
                            role="tabpanel"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            className="items-center gap-8 lg:gap-12"
                        >
                            <div className="flex flex-col items-start pe-0 lg:col-span-6 lg:pe-4">
                                <span className="mb-3 text-xs font-semibold uppercase tracking-wide text-purple-700">
                                    {t(`tabs.${currentTab.id}.badge`)}
                                </span>
                                <h3 className="mb-4 text-2xl leading-[1.18] font-extrabold tracking-tight text-neutral-900 sm:text-3xl md:text-4xl">
                                    {t(`tabs.${currentTab.id}.title`)}
                                </h3>
                                <p className="mb-6 text-xs leading-relaxed font-normal text-neutral-600 sm:text-sm md:text-base">
                                    {t(`tabs.${currentTab.id}.description`)}
                                </p>

                                <a
                                    href="#"
                                    className="group mb-8 inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 underline underline-offset-4 transition-colors hover:text-purple-900 sm:text-sm"
                                >
                                    <span>{t(`tabs.${currentTab.id}.linkText`)}</span>
                                    <ArrowRight
                                        className={`size-4 transition-transform ${locale === "ar" ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}
                                        aria-hidden="true"
                                    />
                                </a>

                                <div className="flex w-full flex-col gap-3 border-t border-neutral-200/80 pt-6">
                                    {[0, 1, 2].map((featureIndex) => (
                                        <div key={featureIndex} className="flex items-center gap-2.5 text-xs font-medium text-neutral-700 sm:text-sm">
                                            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                                            <span>{t(`tabs.${currentTab.id}.features.${featureIndex}`)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </HatchedContainer>
        </section>
    );
}
