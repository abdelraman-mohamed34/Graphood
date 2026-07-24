"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CardItem {
    id: number;
    date: string;
    title: string;
    imageUrl: string;
}

const baseCardsData: CardItem[] = [
    {
        id: 1,
        date: "Jan 14, 2026",
        title: "What Nordic VCs actually look at before taking a meeting",
        imageUrl:
            "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: 2,
        date: "Dec 3, 2025",
        title: "Runway planning when the market is slow",
        imageUrl:
            "https://images.unsplash.com/photo-1531824475211-72594993ce2a?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: 3,
        date: "Nov 11, 2025",
        title: "You closed the round. Now what?",
        imageUrl:
            "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: 4,
        date: "Oct 28, 2025",
        title: "Building sustainable growth in volatile markets",
        imageUrl:
            "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop",
    },
];

const infiniteCards = [...baseCardsData, ...baseCardsData, ...baseCardsData];

function InfiniteSnapGallery() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (scrollContainerRef.current) {
            const { scrollWidth } = scrollContainerRef.current;
            scrollContainerRef.current.scrollLeft = scrollWidth / 3;
        }
    }, []);

    const handleScrollLoop = () => {
        if (!scrollContainerRef.current) return;

        const { scrollLeft, scrollWidth } = scrollContainerRef.current;
        const singleSetWidth = scrollWidth / 3;

        if (scrollLeft <= 10) {
            scrollContainerRef.current.scrollLeft = singleSetWidth + scrollLeft;
        } else if (scrollLeft >= singleSetWidth * 2) {
            scrollContainerRef.current.scrollLeft = scrollLeft - singleSetWidth;
        }

        const normalizedScroll = scrollLeft % singleSetWidth;
        const index = Math.round(
            (normalizedScroll / singleSetWidth) * baseCardsData.length
        ) % baseCardsData.length;

        setActiveIndex(index);
    };

    const handleScroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const cardWidth = scrollContainerRef.current.clientWidth / 3;
            const scrollAmount = direction === "left" ? -cardWidth * 1.2 : cardWidth * 1.2;

            scrollContainerRef.current.scrollBy({
                left: scrollAmount,
                behavior: "smooth",
            });
        }
    };

    return (
        <section className="relative w-full bg-black py-16 px-4 md:px-12 text-white overflow-hidden">
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
                            staggerChildren: 0.1,
                        },
                    },
                }}
                className="relative group max-w-7xl mx-auto"
            >
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleScroll("left")}
                    className="absolute left-2 md:-left-6 top-1/2 -translate-y-1/2 z-30 h-14 w-14 rounded-full bg-black/90 hover:bg-white hover:text-black text-white flex items-center justify-center border border-white/30 transition-colors duration-300 shadow-2xl backdrop-blur-md"
                    aria-label="Previous slide"
                >
                    <svg
                        className="w-7 h-7 pr-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleScroll("right")}
                    className="absolute right-2 md:-right-6 top-1/2 -translate-y-1/2 z-30 h-14 w-14 rounded-full bg-black/90 hover:bg-white hover:text-black text-white flex items-center justify-center border border-white/30 transition-colors duration-300 shadow-2xl backdrop-blur-md"
                    aria-label="Next slide"
                >
                    <svg
                        className="w-7 h-7 pl-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </motion.button>

                <div
                    ref={scrollContainerRef}
                    onScroll={handleScrollLoop}
                    className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-8 pt-2 scrollbar-none"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {infiniteCards.map((card, idx) => (
                        <motion.div
                            key={`${card.id}-${idx}`}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                show: { opacity: 1, y: 0 },
                            }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="snap-start shrink-0 w-[85%] sm:w-[45%] md:w-[31%] flex flex-col gap-3 group/card"
                        >
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-neutral-900 border border-white/10">
                                <img
                                    src={card.imageUrl}
                                    alt={card.title}
                                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-105"
                                />
                            </div>

                            <div className="flex flex-col gap-1 pr-2">
                                <span className="text-xs text-neutral-400 font-medium">
                                    {card.date}
                                </span>
                                <h3 className="text-sm md:text-base font-medium leading-snug text-neutral-100 group-hover/card:text-white transition-colors">
                                    {card.title}
                                </h3>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="flex items-center justify-center gap-2 mt-4">
                    {baseCardsData.map((_, idx) => (
                        <motion.span
                            key={idx}
                            animate={{
                                width: activeIndex === idx ? 24 : 8,
                                backgroundColor: activeIndex === idx ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.3)",
                            }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="h-2 rounded-full"
                        />
                    ))}
                </div>
            </motion.div>
        </section>
    );
}

export default React.memo(InfiniteSnapGallery);