"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ThumbsUp, Eye, MessageSquare } from "lucide-react";

interface CyberXHeroFooterProps {
    initialLikes?: number;
    initialViews?: number;
    initialComments?: number;
    publishDate?: string;
    title?: string;
}

export default function CyberXHeroFooter({
    initialLikes = 4,
    initialViews = 79,
    initialComments = 0,
    publishDate = "Published: May 29th 2026",
    title = "CyberX — Next Gen Cybersecurity Hero Section",
}: CyberXHeroFooterProps) {
    const [likes, setLikes] = useState(initialLikes);
    const [hasLiked, setHasLiked] = useState(false);

    const handleLike = () => {
        if (hasLiked) {
            setLikes((prev) => prev - 1);
            setHasLiked(false);
        } else {
            setLikes((prev) => prev + 1);
            setHasLiked(true);
        }
    };

    return (
        <section className="w-full bg-black text-white py-12 px-4 mt-12 flex flex-col items-center justify-center font-sans selection:bg-neutral-800">
            <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: false, amount: 0.3 }}
                variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: {
                        opacity: 1,
                        y: 0,
                        transition: {
                            duration: 0.6,
                            ease: [0.16, 1, 0.3, 1],
                            staggerChildren: 0.1,
                        },
                    },
                }}
                className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto"
            >
                <motion.button
                    onClick={handleLike}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    variants={{
                        hidden: { scale: 0.8, opacity: 0 },
                        show: { scale: 1, opacity: 1 },
                    }}
                    className={`w-16 h-16 rounded-full flex flex-col items-center justify-center transition-colors duration-300 shadow-lg cursor-pointer ${hasLiked
                        ? "bg-white text-black"
                        : "bg-[#2A2A2A] hover:bg-[#333333] text-white"
                        }`}
                    aria-label="Like"
                >
                    <ThumbsUp
                        className={`w-5 h-5 mb-0.5 ${hasLiked ? "fill-black" : "fill-none"
                            }`}
                    />
                    <span className="text-xs font-semibold leading-none">
                        {likes}
                    </span>
                </motion.button>

                <motion.h1
                    variants={{
                        hidden: { opacity: 0, y: 10 },
                        show: { opacity: 1, y: 0 },
                    }}
                    className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white pt-2"
                >
                    {title}
                </motion.h1>

                <motion.div
                    variants={{
                        hidden: { opacity: 0, y: 10 },
                        show: { opacity: 1, y: 0 },
                    }}
                    className="flex items-center gap-4 text-xs sm:text-sm font-medium text-neutral-400"
                >
                    <div className="flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5 fill-current" />
                        <span>{likes}</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{initialViews}</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{initialComments}</span>
                    </div>
                </motion.div>

                <motion.p
                    variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1 },
                    }}
                    className="text-xs text-neutral-500 font-normal pt-2"
                >
                    {publishDate}
                </motion.p>
            </motion.div>
        </section>
    );
}