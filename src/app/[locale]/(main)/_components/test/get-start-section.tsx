"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

const floatingKeywords = [
    { text: "Alternative investing", top: "12%", left: "35%", blur: "blur-[3px]", opacity: "opacity-40 text-[#666666]", radius: 300, angle: 280 },
    { text: "Financial planning", top: "20%", left: "59%", blur: "blur-[4px]", opacity: "opacity-30 text-[#777777]", radius: 260, angle: 320 },
    { text: "Stock option optimization", top: "28%", left: "10%", blur: "blur-[3px]", opacity: "opacity-35 text-[#555555]", radius: 380, angle: 160 },
    { text: "Secondary market", top: "31%", left: "73%", blur: "blur-[5px]", opacity: "opacity-25 text-[#888888]", radius: 340, angle: 20 },
    { text: "Net worth tracking", top: "52%", left: "7%", blur: "blur-[4px]", opacity: "opacity-30 text-[#666666]", radius: 400, angle: 180 },
    { text: "Tax filing", top: "45%", left: "84%", blur: "blur-[3px]", opacity: "opacity-35 text-[#555555]", radius: 360, angle: 0 },
    { text: "Philanthropy", top: "58%", left: "81%", blur: "blur-[4px]", opacity: "opacity-30 text-[#777777]", radius: 380, angle: 30 },
    { text: "Stock option financing", top: "72%", left: "10%", blur: "blur-[3px]", opacity: "opacity-35 text-[#666666]", radius: 370, angle: 200 },
    { text: "Estate planning", top: "77%", left: "64%", blur: "blur-[2px]", opacity: "opacity-40 text-[#444444]", radius: 290, angle: 60 },
    { text: "Diversification", top: "84%", left: "23%", blur: "blur-[4px]", opacity: "opacity-30 text-[#777777]", radius: 320, angle: 240 },
    { text: "Community of tech leaders", top: "91%", left: "42%", blur: "blur-[3px]", opacity: "opacity-35 text-[#555555]", radius: 350, angle: 100 },
];

function GetStartSection() {
    return (
        <section className="relative w-full min-h-screen bg-white text-black flex flex-col items-center justify-center overflow-hidden px-4 selection:bg-neutral-200">
            {/* خلفية الكلمات الباهتة بتأثير الانبثاق الجماعي المفاجئ من الداخل للخارج */}
            <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
                {floatingKeywords.map((item, index) => {
                    return (
                        <motion.span
                            key={index}
                            initial={{
                                scale: 0,
                                opacity: 0,
                                x: 0,
                                y: 0,
                            }}
                            whileInView={{
                                scale: [0, 1.1, 1],
                                opacity: [0, 0.8, 1],
                            }}
                            viewport={{ once: false }}
                            transition={{
                                duration: 0.9,
                                ease: [0.16, 1, 0.3, 1], // انطلاق انفجاري ناعم ومفاجئ لكل الكلمات معاً
                            }}
                            style={{ top: item.top, left: item.left }}
                            className={`absolute text-xs sm:text-sm font-normal tracking-tight transition-all duration-300 ${item.blur} ${item.opacity}`}
                        >
                            <motion.span
                                animate={{
                                    y: [-8, 8, -8],
                                }}
                                transition={{
                                    duration: 6,
                                    repeat: Infinity,
                                    repeatType: "mirror",
                                    ease: "easeInOut",
                                    delay: index * 0.1,
                                }}
                                className="block"
                            >
                                {item.text}
                            </motion.span>
                        </motion.span>
                    );
                })}
            </div>

            <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: false }}
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.15,
                            delayChildren: 0.1,
                        },
                    },
                }}
                className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto space-y-6"
            >
                <motion.div
                    variants={{
                        hidden: { scale: 0.8, opacity: 0, y: 15 },
                        show: { scale: 1, opacity: 1, y: 0 },
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="w-12 h-12 bg-[#111111] text-white rounded-xl flex items-center justify-center shadow-md mb-1 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <span className="font-serif text-2xl font-bold tracking-tighter">
                        G
                    </span>
                </motion.div>

                <motion.h1
                    variants={{
                        hidden: { y: 25, opacity: 0 },
                        show: { y: 0, opacity: 1 },
                    }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-normal tracking-[-0.03em] text-[#111111] leading-[1.08]"
                >
                    Your personal finance <br />
                    department.
                </motion.h1>

                <motion.div
                    variants={{
                        hidden: { y: 20, opacity: 0 },
                        show: { y: 0, opacity: 1 },
                    }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-2.5 pt-2"
                >
                    <Link href="/marketplace">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            className="group flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#111111] hover:bg-black text-white text-xs sm:text-sm font-medium transition-colors duration-200 shadow-sm"
                        >
                            <span>Get started</span>
                            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform duration-200" />
                        </motion.button>
                    </Link>

                    <Link href="/marketplace">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            className="px-5 py-2.5 rounded-lg bg-white hover:bg-neutral-50 text-[#111111] text-xs sm:text-sm font-medium border border-neutral-200 transition-colors duration-200 shadow-sm"
                        >
                            Explore our market
                        </motion.button>
                    </Link>

                </motion.div>
            </motion.div>
        </section>
    );
}

export default React.memo(GetStartSection);