"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { useLightweightMotion } from "@/shared/lib/hooks/use-lightweight-motion";

const stats = [
    { id: "uptime", value: 100, suffix: "%" },
    { id: "modules", value: 12, suffix: "+" },
    { id: "builders", value: 50, suffix: "k+" },
] as const;

function Counter({ value, suffix }: { value: number; suffix: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });
    const reduceMotion = useLightweightMotion();
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (!isInView) return;
        if (reduceMotion) return;

        const controls = animate(0, value, {
            duration: 1.4,
            ease: "easeOut",
            onUpdate: (latest) => setDisplayValue(Math.round(latest)),
        });

        return () => controls.stop();
    }, [isInView, reduceMotion, value]);

    return <span ref={ref} className="inline-block min-w-[4ch] tabular-nums">{reduceMotion ? value : displayValue}{suffix}</span>;
}

export default function AboutStats() {
    const t = useTranslations("about.stats");
    const reduceMotion = useLightweightMotion();

    return (
        <section aria-labelledby="about-stats-title" className="border-b border-neutral-300 bg-white px-5 py-20 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex items-end justify-between gap-6">
                    <div>
                        <p className="mb-4 text-[11px] uppercase tracking-[0.26em] text-teal-700">{t("eyebrow")}</p>
                        <h2 id="about-stats-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("title")}</h2>
                    </div>
                    <span className="hidden text-[10px] uppercase tracking-[0.24em] text-neutral-500 sm:block">{t("liveLabel")}</span>
                </div>

                <div className="grid border-s border-t border-neutral-300 md:grid-cols-3">
                    {stats.map((stat, index) => (
                        <motion.article
                            key={stat.id}
                            initial={reduceMotion ? false : { opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={reduceMotion ? { duration: 0 } : { delay: index * 0.1 }}
                            className="border-b border-e border-neutral-300 bg-[#f7f6f4] p-8 sm:p-10"
                        >
                            <p className="text-5xl font-semibold tracking-[-0.06em] text-maroon sm:text-6xl" aria-label={`${stat.value}${stat.suffix}`}>
                                <Counter value={stat.value} suffix={stat.suffix} />
                            </p>
                            <h3 className="mt-5 text-sm font-semibold text-neutral-900">{t(`items.${stat.id}.label`)}</h3>
                            <p className="mt-2 text-xs leading-6 text-neutral-600">{t(`items.${stat.id}.description`)}</p>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
