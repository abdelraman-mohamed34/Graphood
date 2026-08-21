"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
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
    const sectionRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"],
    });

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        // الـ Scroll-driven switching يشتغل فقط على الشاشات الكبيرة
        if (typeof window !== "undefined" && window.innerWidth >= 768) {
            const step = 1 / tabs.length;
            const index = Math.min(Math.floor(latest / step), tabs.length - 1);
            if (tabs[index] && tabs[index].id !== activeTab) {
                setActiveTab(tabs[index].id);
            }
        }
    });

    const currentTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

    return (
        <div ref={sectionRef} className="relative h-auto md:h-[250vh] w-full select-none py-6 md:py-0">
            <div className="static md:sticky md:top-0 flex min-h-fit md:h-screen w-full flex-col justify-center px-3 sm:px-6 pb-6 text-neutral-900">
                <div className="mx-auto w-full max-w-[1600px]">

                    {/* Header Section */}
                    <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl md:text-5xl leading-tight">
                            {t("title")}
                        </h2>
                        <Link
                            href="/marketplace"
                            className="self-start border border-maroon bg-maroon px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-teal active:scale-95 sm:self-auto sm:text-sm shrink-0"
                        >
                            {t("cta")}
                        </Link>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="mb-4 flex w-full items-center justify-between overflow-x-auto border border-neutral-200/80 bg-white no-scrollbar">
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
                                        className={`relative flex cursor-pointer items-center justify-center gap-2 p-3 text-xs font-semibold transition-all duration-200 sm:text-sm ${isActive
                                            ? "bg-[#ededed] text-neutral-900 shadow-sm"
                                            : "text-neutral-600 hover:bg-white/40 hover:text-neutral-900"
                                            }`}
                                    >
                                        <Icon className={`size-4 shrink-0 ${isActive ? "text-teal" : "text-neutral-500"}`} aria-hidden="true" />
                                        <span className="truncate">{t(`tabs.${tab.id}.label`)}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Dynamic Content Panel */}
                    <HatchedContainer sides="y" padding="p-2 sm:p-4">
                        <div className="relative w-full overflow-hidden border border-neutral-300 bg-[#f7f6f4] p-4 sm:p-6 md:p-8">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentTab.id}
                                    id={`ecosystem-panel-${currentTab.id}`}
                                    role="tabpanel"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex flex-col items-start">
                                        <span className="mb-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-teal">
                                            {t(`tabs.${currentTab.id}.badge`)}
                                        </span>
                                        <h3 className="mb-2 text-xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl leading-snug">
                                            {t(`tabs.${currentTab.id}.title`)}
                                        </h3>
                                        <p className="mb-3 text-xs sm:text-sm leading-relaxed text-neutral-600">
                                            {t(`tabs.${currentTab.id}.description`)}
                                        </p>

                                        <a
                                            href="#"
                                            className="group mb-4 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-teal underline underline-offset-4 transition-colors hover:text-maroon"
                                        >
                                            <span>{t(`tabs.${currentTab.id}.linkText`)}</span>
                                            <ArrowRight
                                                className={`size-4 transition-transform ${locale === "ar" ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}
                                                aria-hidden="true"
                                            />
                                        </a>

                                        <div className="flex w-full flex-col gap-2 border-t border-neutral-200/80 pt-3">
                                            {[0, 1, 2].map((featureIndex) => (
                                                <div key={featureIndex} className="flex items-center gap-2 text-xs sm:text-sm font-medium text-neutral-700">
                                                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                                                    <span className="truncate">{t(`tabs.${currentTab.id}.features.${featureIndex}`)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </HatchedContainer>

                </div>
            </div>
        </div>
    );
}