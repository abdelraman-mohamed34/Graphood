// src/app/[locale]/(main)/marketplace/systems/[system_id]/_components/check-out-btn.tsx
"use client";

import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";


export default function CheckoutButton({ systemId }: { systemId: string }) {
    const t = useTranslations("marketplace.details");
    const locale = useLocale();

    return (
        <Link href={`/marketplace/systems/${systemId}/get`} className="block w-full">
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex w-full items-center justify-center overflow-hidden rounded bg-primary px-6 py-3.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:shadow-xl dark:bg-white dark:text-black dark:hover:bg-neutral-100"
            >
                <div className="flex items-center gap-2.5 z-10">
                    <ShoppingBag className="w-4 h-4 text-neutral-400 dark:text-neutral-600 group-hover:scale-110 transition-transform duration-200" />
                    <span>{t.has("getNow") ? t("getNow") : locale === "ar" ? "احصل عليه الآن" : "Get now"}</span>
                </div>
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
            </motion.button>
        </Link>
    );
}
