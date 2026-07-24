"use client";

import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CyberXHeroSection() {
    return (
        <section className="relative w-full h-screen min-h-[700px] bg-black text-white flex flex-col justify-between overflow-hidden font-sans select-none">

            <div className="absolute inset-0 pointer-events-none flex z-0">
                <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] bg-[#4ade80]/20 rounded-full blur-[140px] z-0" />
                <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#16a34a]/15 rounded-full blur-[120px] z-0" />

                {Array.from({ length: 16 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex-1 h-full border-r border-white/[0.04] bg-gradient-to-b from-transparent via-white/[0.01] to-transparent relative"
                    >
                        <div className="absolute inset-y-0 right-0 w-[1px] bg-black/60 shadow-[1px_0_3px_rgba(0,0,0,0.8)]" />
                    </div>
                ))}
            </div>

            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-full max-w-[1400px] mx-auto px-8 pt-8 flex items-center justify-between"
            >
                <div className="text-xl font-black tracking-widest text-white">
                    GRAPHOOD
                </div>

                <Link href='/marketplace'>
                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className="px-6 py-2 rounded-full bg-[#39d353]/15 text-[#39d353] border border-[#39d353]/30 text-xs sm:text-sm font-medium hover:bg-[#39d353]/25 transition-all duration-300 cursor-pointer backdrop-blur-sm"
                    >
                        Get Started
                    </motion.button>
                </Link>
            </motion.header>

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center justify-center my-auto">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-semibold tracking-tight text-white leading-[1.08]"
                >
                    Next-Gen Digital Shield <br />
                    Built to Outsmart Every Threat.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-6 text-sm sm:text-base md:text-lg text-neutral-300 font-normal max-w-2xl leading-relaxed opacity-90"
                >
                    Intelligent defense that adapts, predicts, and evolves in real time <br className="hidden sm:inline" />
                    keeping your systems secure long before attacks even begin.
                </motion.p>

                {/* زر Activate Shield Now */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-8"
                >
                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className="group flex items-center gap-3 px-6 py-3 rounded-full bg-[#39d353] text-black font-semibold text-sm sm:text-base transition-all duration-300 shadow-[0_0_25px_rgba(57,211,83,0.3)] hover:shadow-[0_0_35px_rgba(57,211,83,0.5)] cursor-pointer"
                    >
                        <span>Activate Shield Now</span>
                        <div className="w-6 h-6 rounded-full border border-black/30 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                            <ArrowRight className="w-3.5 h-3.5 text-black" />
                        </div>
                    </motion.button>
                </motion.div>
            </div>

            {/* 4. عناصر الفوتر في الأسفل (يمين وشمال) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="relative z-10 w-full max-w-[1400px] mx-auto px-8 pb-10 flex flex-row items-end justify-between text-xs sm:text-sm"
            >
                {/* أقصى الشمال الأسفل */}
                <div className="flex flex-col gap-1 tracking-[0.25em] font-medium text-neutral-300 uppercase leading-snug">
                    <span>A D A P T I V E</span>
                    <span>S E C U R I T Y</span>
                </div>

                {/* أقصى اليمين الأسفل */}
                <div className="text-neutral-400 font-normal text-right">
                    <span>2,000+ Secured Businesses</span>
                    <span className="mx-2 text-neutral-600">•</span>
                    <span>500+ Defense Technologies</span>
                </div>
            </motion.div>
        </section>
    );
}