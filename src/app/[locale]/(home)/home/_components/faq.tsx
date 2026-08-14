"use client";

import { useState } from "react";
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
        <section className="relative flex min-h-[500px] w-full justify-center overflow-hidden border-t border-neutral-300 bg-[#f4f3f1] px-6 py-16 text-[#21181b] sm:px-12 md:px-16">
            <div className="relative z-10 flex w-full max-w-[900px] flex-col items-center">
                <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight text-maroon sm:text-4xl md:text-5xl">
                    {t("title")}
                </h2>

                <div className="flex w-full flex-col gap-4">
                    {faqItems.map((item, index) => {
                        const isOpen = openIndex === index;

                        return (
                            <div
                                key={item}
                                className="w-full overflow-hidden rounded-sm border border-neutral-300 bg-white transition-all duration-300 hover:border-teal"
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleFAQ(index)}
                                    aria-expanded={isOpen}
                                    aria-controls={`faq-answer-${item}`}
                                    className="group flex w-full cursor-pointer select-none items-center justify-between px-6 py-5 text-start"
                                >
                                    <span className={`text-base transition-all duration-300 sm:text-lg ${isOpen ? "text-teal" : "text-neutral-900"}`}>
                                        {t(`items.${item}.question`)}
                                    </span>
                                    <div
                                        className={`ms-4 shrink-0 text-teal transition-transform duration-200 motion-reduce:transition-none ${isOpen ? "rotate-180" : "rotate-0"}`}
                                    >
                                        <ChevronDown className="size-4" aria-hidden="true" />
                                    </div>
                                </button>

                                {isOpen && (
                                    <div id={`faq-answer-${item}`} role="region">
                                        <div className="px-6 pb-6 pt-1 text-sm leading-relaxed text-neutral-600 sm:text-base">
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
