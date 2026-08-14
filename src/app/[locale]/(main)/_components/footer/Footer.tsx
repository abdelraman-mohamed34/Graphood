"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { FooterBrand, FooterColumn } from "./footer-components";

export function Footer() {
    const t = useTranslations("footer");
    const currentYear = new Date().getFullYear();

    const footerSections = [
        {
            title: t("categories.platform"),
            links: [
                { label: t("links.features"), href: "#features" },
                { label: t("links.pricing"), href: "#pricing" },
            ],
        },
        {
            title: t("categories.resources"),
            links: [
                { label: t("links.docs"), href: "/docs" },
                { label: t("links.api"), href: "/api-reference" },
            ],
        },
        {
            title: t("categories.company"),
            links: [
                { label: t("links.about"), href: "/about" },
                { label: t("links.blog"), href: "/blog" },
            ],
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <footer className="relative w-full flex justify-center bg-[oklch(0.25_0.05_15)] text-white border-t border-white/10 transition-colors duration-200 overflow-hidden">
            <div className="w-full mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 pt-12 pb-6">
                <motion.div
                    className="grid grid-cols-1 gap-12 xl:grid-cols-3 xl:gap-8"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={containerVariants}
                >
                    {/* Brand Section */}
                    <div className="xl:col-span-1">
                        <FooterBrand description={t("description")} />
                    </div>

                    {/* Links Sections Grid */}
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-3 xl:col-span-2">
                        {footerSections.map((section) => (
                            <motion.div key={section.title} variants={itemVariants}>
                                <FooterColumn title={section.title} links={section.links} />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Bottom Section - Big Typography Layout */}
                <div className="w-full flex flex-col items-center justify-center mt-12 pt-8 border-t border-white/10 overflow-hidden select-none">
                    <h1 className="text-[12vw] sm:text-[140px] md:text-[180px] font-extrabold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/20 via-white/5 to-transparent text-center">
                        GRAPHOOD
                    </h1>

                    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs text-white/50">
                        <p>© {currentYear} Graphood. {t("rights")}</p>
                        <div className="flex gap-6">
                            <Link href="/privacy" className="hover:text-white transition-colors">
                                {t("links.privacy")}
                            </Link>
                            <Link href="/terms" className="hover:text-white transition-colors">
                                {t("links.terms")}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
