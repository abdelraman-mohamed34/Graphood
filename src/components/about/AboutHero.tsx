"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MoveDown } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AboutHero() {
    const t = useTranslations("about.hero");
    const reduceMotion = useReducedMotion();

    return (
        <section aria-labelledby="about-hero-title" className="relative min-h-[760px] border-b border-neutral-300 bg-white px-5 sm:px-8 lg:px-12">
            <div className="mx-auto min-h-[760px] max-w-7xl">
                <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                    className="flex min-h-[760px] flex-col justify-between py-24 lg:py-28"
                >
                    <div>
                        <div className="mb-9 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-teal-700">
                            <span className="size-2 bg-teal-700" aria-hidden="true" />
                            <span>{t("eyebrow")}</span>
                        </div>
                        <h1 id="about-hero-title" className="max-w-5xl text-5xl leading-[0.98] tracking-[-0.04em] text-balance text-maroon sm:text-7xl lg:text-[6.4rem]">
                            {t("title")}
                        </h1>
                        <p className="mt-9 max-w-2xl text-base leading-8 text-neutral-600 sm:text-lg">
                            {t("description")}
                        </p>
                    </div>

                    <div className="mt-16 flex items-center gap-4 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
                        <MoveDown className="size-4" aria-hidden="true" />
                        <span>{t("scroll")}</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
