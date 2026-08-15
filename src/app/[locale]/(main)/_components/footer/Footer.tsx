"use client";

import { useTranslations } from "next-intl";

import LanguageMenu from "../navbar/navbar-language-menu";
import { FooterBrand, FooterColumn } from "./footer-components";

export function Footer() {
    const t = useTranslations("footer");

    const footerSections = [
        {
            title: t("categories.product"),
            links: [
                { label: t("links.systems"), href: "/marketplace" },
                { label: t("links.workspaces"), href: "/workspaces" },
            ],
        },
        {
            title: t("categories.developers"),
            links: [
                { label: t("links.developerPortal"), href: "/developer/systems" },
                { label: t("links.docs"), href: "/developer/docs" },
                { label: t("links.quickStart"), href: "/developer/docs/quick-start" },
                { label: t("links.apiReference"), href: "/developer/docs/endpoints" },
                { label: t("links.statusSandbox"), href: "/developer/docs/endpoints/health" },
            ],
        },
        {
            title: t("categories.company"),
            links: [
                { label: t("links.about"), href: "/about" },
                { label: t("links.changelog"), href: "/developer/docs/changelog" },
                { label: t("links.support"), href: "/faq" },
            ],
        },
    ];

    return (
        <footer className="w-full border-t border-white/10 bg-maroon text-white">
            <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-12">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                    <FooterBrand
                        description={t("description")}
                        githubLabel={t("social.github")}
                    />

                    {footerSections.map((section) => (
                        <FooterColumn
                            key={section.title}
                            title={section.title}
                            links={section.links}
                        />
                    ))}
                </div>

                <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
                    <p>© 2026 Graphood. {t("rights")}</p>
                    <LanguageMenu />
                </div>
            </div>
        </footer>
    );
}

export default Footer;
