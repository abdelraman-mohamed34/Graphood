"use client";

import { motion } from "framer-motion";
import { Blocks, CodeXml, Gauge, Globe2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLightweightMotion } from "@/shared/lib/hooks/use-lightweight-motion";

const principles = [
    { id: "modular", icon: Blocks, span: "lg:col-span-2" },
    { id: "speed", icon: Gauge, span: "lg:col-span-1" },
    { id: "domains", icon: Globe2, span: "lg:col-span-1" },
    { id: "sdk", icon: CodeXml, span: "lg:col-span-2" },
] as const;

export default function AboutGrid() {
    const t = useTranslations("about.principles");
    const reduceMotion = useLightweightMotion();

    return (
        <section aria-labelledby="about-principles-title" className="border-b border-neutral-300 bg-[#f4f3f1] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
            <div className="mx-auto max-w-7xl">
                <div className="mb-14 grid gap-6 lg:grid-cols-2 lg:items-end">
                    <div>
                        <p className="mb-5 text-[11px] uppercase tracking-[0.26em] text-maroon/70">{t("eyebrow")}</p>
                        <h2 id="about-principles-title" className="text-4xl leading-tight font-semibold tracking-tight sm:text-6xl">
                            {t("title")}
                        </h2>
                    </div>
                    <p className="max-w-xl text-sm leading-7 text-neutral-600 lg:justify-self-end lg:text-base">{t("description")}</p>
                </div>

                <div className="grid border-s border-t border-neutral-300 md:grid-cols-2 lg:grid-cols-3">
                    {principles.map((principle, index) => {
                        const Icon = principle.icon;

                        return (
                            <motion.article
                                key={principle.id}
                                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.25 }}
                                transition={{ duration: 0.5, delay: index * 0.08 }}
                                whileHover={reduceMotion ? undefined : { y: -4 }}
                                className={`group relative min-h-72 overflow-hidden border-b border-e border-neutral-300 bg-white p-7 transition-colors hover:bg-[#ece9e7] sm:p-9 ${principle.span}`}
                            >
                                <div className="absolute end-0 top-0 size-24 border-b border-s border-neutral-200 bg-neutral-50 transition-colors group-hover:bg-[#e4ece9]" />
                                <Icon className="relative z-10 size-7 text-teal-700" aria-hidden="true" />
                                <div className="mt-20 max-w-xl">
                                    <p className="mb-4 text-[10px] tracking-[0.22em] text-neutral-500">0{index + 1}</p>
                                    <h3 className="text-2xl font-semibold tracking-tight text-maroon">{t(`items.${principle.id}.title`)}</h3>
                                    <p className="mt-4 text-sm leading-7 text-neutral-600">{t(`items.${principle.id}.description`)}</p>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
