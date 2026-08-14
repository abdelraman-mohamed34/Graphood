"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

const faqItems = ["platform", "outwin", "subdomains", "developers", "trial"] as const;

function FAQ() {
    const t = useTranslations("home.landing.faq");
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="relative flex min-h-[500px] w-full justify-center overflow-hidden px-6 py-16 text-white sm:px-12 md:px-16">
            <div className="pointer-events-none absolute inset-0 m-auto h-[300px] w-[600px] rounded-full bg-emerald-500/5 blur-[140px]" />
            <div className="relative z-10 flex w-full max-w-[900px] flex-col items-center">
                <h2 className="mb-10 text-center text-3xl tracking-tight text-white sm:text-4xl md:text-5xl">
                    {t("title")}
                </h2>

                <div className="flex w-full flex-col gap-4">
                    {faqItems.map((item, index) => {
                        const isOpen = openIndex === index;

                        return (
                            <div
                                key={item}
                                className="w-full overflow-hidden rounded-sm border border-white/10 bg-maroon backdrop-blur-md transition-all duration-300 hover:border-indigo-700"
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleFAQ(index)}
                                    aria-expanded={isOpen}
                                    aria-controls={`faq-answer-${item}`}
                                    className="group flex w-full cursor-pointer select-none items-center justify-between px-6 py-5 text-start"
                                >
                                    <span className={`text-base transition-all duration-300 sm:text-lg ${isOpen ? "text-indigo-700" : "text-white"}`}>
                                        {t(`items.${item}.question`)}
                                    </span>
                                    <motion.div
                                        animate={{ rotate: isOpen ? 180 : 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="ms-4 shrink-0 text-indigo-600"
                                    >
                                        <ChevronDown className="size-4" aria-hidden="true" />
                                    </motion.div>
                                </button>

                                {isOpen && (
                                    <div id={`faq-answer-${item}`} role="region">
                                        <div className="px-6 pb-6 pt-1 text-sm font-light leading-relaxed sm:text-base">
                                            {t(`items.${item}.answer`)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default FAQ;
