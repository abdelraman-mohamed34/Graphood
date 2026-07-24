"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const logos = [
    { name: "Discord", opacity: "opacity-40" },
    { name: "OpenAI", opacity: "opacity-80" },
    { name: "Slack", opacity: "opacity-90" },
    { name: "ramp ➔", opacity: "opacity-100" },
    { name: "Retool", opacity: "opacity-90" },
    { name: "Lattice", opacity: "opacity-80" },
    { name: "Coinbase", opacity: "opacity-40" },
];

export default function TechPeopleSection() {
    return (
        <section className="w-full bg-white text-black flex flex-col gap-5 pt-20 items-center justify-center [contain:content]">
            <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: false, amount: 0.3 }}
                variants={{
                    hidden: { opacity: 0, y: 15 },
                    show: {
                        opacity: 1,
                        y: 0,
                        transition: {
                            duration: 0.6,
                            staggerChildren: 0.08,
                        },
                    },
                }}
                className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-8 py-4 overflow-hidden px-4"
            >
                <motion.p
                    variants={{
                        hidden: { opacity: 0, x: -15 },
                        show: { opacity: 1, x: 0 },
                    }}
                    className="text-xs text-neutral-500 font-medium max-w-[200px] leading-tight text-center lg:text-left shrink-0"
                >
                    Wealth management for people from leading tech companies.
                </motion.p>

                <div className="relative w-full overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                    <div className="flex items-center justify-between lg:justify-end gap-8 md:gap-12 text-lg md:text-xl font-bold tracking-tight text-neutral-800">
                        {logos.map((logo, index) => (
                            <motion.span
                                key={index}
                                variants={{
                                    hidden: { opacity: 0, y: 10 },
                                    show: { opacity: 1, y: 0 },
                                }}
                                className={`transition-opacity duration-300 hover:opacity-100 cursor-pointer ${logo.opacity}`}
                            >
                                {logo.name}
                            </motion.span>
                        ))}
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: false, amount: 0.2 }}
                variants={{
                    hidden: { opacity: 0, y: 30 },
                    show: {
                        opacity: 1,
                        y: 0,
                        transition: {
                            duration: 0.8,
                            ease: [0.16, 1, 0.3, 1],
                            staggerChildren: 0.12,
                        },
                    },
                }}
                className="relative w-full min-w-full min-h-[480px] bg-black text-white overflow-hidden flex flex-col lg:flex-row items-center justify-between p-8 md:p-16 transform-gpu"
            >
                <motion.div
                    variants={{
                        hidden: { opacity: 0, scale: 1.05 },
                        show: { opacity: 0.4, scale: 1 },
                    }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute left-0 top-0 bottom-0 w-full lg:w-1/2 pointer-events-none"
                >
                    <Image
                        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"
                        alt="Abstract 3D Shape"
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority={false}
                        className="object-cover object-left"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/50 to-black" />
                </motion.div>

                <div className="hidden lg:block w-1/2" />

                <div className="relative z-10 w-full lg:w-1/2 flex flex-col items-start gap-6 max-w-xl">
                    <motion.h2
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            show: { opacity: 1, y: 0 },
                        }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight leading-[1.1] text-neutral-100"
                    >
                        By tech people, <br />
                        for tech people.
                    </motion.h2>

                    <motion.p
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            show: { opacity: 1, y: 0 },
                        }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="text-sm md:text-base text-neutral-400 font-normal leading-relaxed max-w-md"
                    >
                        Compound is the product we have always wanted: a thoughtfully
                        designed, all-in-one solution for managing our personal finances.
                    </motion.p>

                    <motion.button
                        variants={{
                            hidden: { opacity: 0, y: 15 },
                            show: { opacity: 1, y: 0 },
                        }}
                        transition={{ duration: 0.6 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="mt-2 group flex items-center gap-2 px-5 py-2.5 rounded-lg bg-neutral-300/90 hover:bg-white text-black text-xs md:text-sm font-medium transition-colors duration-300 shadow-md hover:shadow-lg"
                    >
                        <span>Get started</span>
                        <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:translate-x-0.5 transition-transform" />
                    </motion.button>
                </div>
            </motion.div>
        </section>
    );
}