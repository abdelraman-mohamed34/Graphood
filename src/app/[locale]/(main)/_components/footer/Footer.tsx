"use client";

import React from "react";
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
        <footer className="relative w-full bg-[#0a0a0a] text-[#888888] border-t border-[#1f1f1f] transition-colors duration-200">
            <div className="mx-auto max-w-7xl px-6 pt-16 pb-12 sm:px-8 lg:px-12">
                <motion.div
                    className="grid grid-cols-1 gap-12 xl:grid-cols-3 xl:gap-8"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false }}
                    variants={containerVariants}
                >
                    {/* Brand Section */}
                    <div className="xl:col-span-1">
                        <FooterBrand description={t("description")} />
                    </div>

                    {/* Links Sections Grid */}
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-3 xl:col-span-2">
                        {footerSections.map((section, idx) => (
                            <motion.div key={idx} variants={itemVariants}>
                                <FooterColumn title={section.title} links={section.links} />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Bottom Rights & Legal Section */}
                <div className="mt-16 border-t border-[#1a1a1a] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-[#555555]">
                        &copy; {currentYear} Graphood. {t("rights")}
                    </p>
                    <div className="flex gap-6 text-xs text-[#666666] hidden">
                        <a href="/privacy" className="hover:text-[#ffffff] transition-colors">
                            Privacy Policy
                        </a>
                        <a href="/terms" className="hover:text-[#ffffff] transition-colors">
                            Terms of Service
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;