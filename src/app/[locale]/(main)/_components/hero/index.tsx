"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Blocks, Braces, Building2, Check, Store } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useLightweightMotion } from "@/shared/lib/hooks/use-lightweight-motion";

const modules = [
    { id: "commerce", icon: Store, number: "01" },
    { id: "workspace", icon: Building2, number: "02" },
    { id: "developer", icon: Braces, number: "03" },
] as const;

function ModulePanel() {
    const t = useTranslations("home.landing.heroSection.visual");
    const reduceMotion = useLightweightMotion();

    return (
        <div className="relative h-full min-h-[520px] overflow-hidden border-s border-white/15 bg-teal p-5 text-white sm:p-8 lg:p-10" role="img" aria-label={t("label")}>
            <div className="flex items-center justify-between border-b border-white/20 pb-5 text-[10px] uppercase tracking-[0.22em] text-white/60">
                <span>{t("system")}</span>
                <span className="flex items-center gap-2">
                    <span className="size-1.5 bg-white" aria-hidden="true" />
                    {t("status")}
                </span>
            </div>

            <div className="flex min-h-[430px] flex-col justify-center py-8">
                <div className="mb-7 flex items-center gap-4">
                    <div className="grid size-12 place-items-center border border-white/25 bg-white/10">
                        <Blocks className="size-6" aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold">{t("coreTitle")}</p>
                        <p className="mt-1 text-xs text-white/60">CORE / GRAPHOOD</p>
                    </div>
                </div>

                <div className="ms-6 h-8 w-px bg-white/25" aria-hidden="true" />

                <div className="space-y-2">
                    {modules.map((module, index) => {
                        const Icon = module.icon;

                        return (
                            <motion.div
                                key={module.id}
                                initial={reduceMotion ? false : { opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.25 + index * 0.1 }}
                                whileHover={reduceMotion ? undefined : { x: -4 }}
                                className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border border-white/20 bg-white/[0.08] p-4 transition-colors hover:bg-white/[0.14] rtl:hover:translate-x-1"
                            >
                                <span className="text-[10px] tracking-[0.18em] text-white/45">{module.number}</span>
                                <span className="flex items-center gap-3 text-sm font-semibold">
                                    <Icon className="size-4 text-white/75" aria-hidden="true" />
                                    {t(`modules.${module.id}`)}
                                </span>
                                <Check className="size-4 text-white/70" aria-hidden="true" />
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <p className="absolute bottom-7 end-8 text-[10px] uppercase tracking-[0.2em] text-white/45">
                {t("tenant")}
            </p>
        </div>
    );
}

export default function Hero() {
    const t = useTranslations("home.landing.heroSection");
    const locale = useLocale();
    const reduceMotion = useLightweightMotion();

    return (
        <section className="w-full overflow-hidden border-b border-maroon bg-maroon text-white" aria-labelledby="home-hero-title">
            <div className="mx-auto grid min-h-[calc(100svh-3.5rem)] max-w-[1600px] lg:grid-cols-[1.2fr_0.8fr]">
                <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col justify-between px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24 xl:px-24"
                >
                    <div>
                        <div className="mb-8 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#9ec2bc]">
                            <span className="h-px w-10 bg-[#9ec2bc]" aria-hidden="true" />
                            <span>{t("eyebrow")}</span>
                        </div>

                        <h1 id="home-hero-title" className="max-w-5xl text-5xl leading-[0.94] font-bold tracking-[-0.05em] text-balance sm:text-7xl xl:text-[6.25rem]">
                            {t("title")}
                        </h1>

                        <p className="mt-8 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
                            {t("description")}
                        </p>

                        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/marketplace"
                                className="group inline-flex items-center justify-center gap-3 rounded-sm border border-white bg-white px-6 py-3.5 text-sm font-semibold text-maroon transition-colors hover:border-[#9ec2bc] hover:bg-[#9ec2bc] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                            >
                                <span>{t("primaryCta")}</span>
                                <ArrowUpRight className={`size-4 transition-transform group-hover:-translate-y-0.5 ${locale === "ar" ? "-rotate-90 group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"}`} aria-hidden="true" />
                            </Link>
                            <Link
                                href="/developer/docs"
                                className="inline-flex items-center justify-center border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                            >
                                {t("secondaryCta")}
                            </Link>
                        </div>
                    </div>

                    <div className="mt-16 grid gap-3 border-t border-white/15 pt-6 text-xs text-white/55 sm:grid-cols-3">
                        {["multiTenant", "modular", "developerReady"].map((item) => (
                            <span key={item} className="flex items-center gap-2">
                                <Check className="size-3.5 text-[#9ec2bc]" aria-hidden="true" />
                                {t(`proof.${item}`)}
                            </span>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={reduceMotion ? false : { opacity: 0, x: locale === "ar" ? -28 : 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                    <ModulePanel />
                </motion.div>
            </div>
        </section>
    );
}
