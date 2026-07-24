// src/app/[locale]/(main)/marketplace/systems/[system_id]/_components/check-out-btn.tsx
"use client";

import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/navigation";


export default function CheckoutButton({ systemId }: { systemId: string }) {

    return (
        <Link href={`/marketplace/systems/${systemId}/get`}>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex items-center justify-between w-full max-w-sm px-6 py-3.5 bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 dark:text-black text-white rounded-xl font-medium text-sm transition-all duration-200 shadow-md hover:shadow-xl disabled:opacity-75 disabled:cursor-not-allowed overflow-hidden"
            >
                <div className="flex items-center gap-2.5 z-10">
                    <ShoppingBag className="w-4 h-4 text-neutral-400 dark:text-neutral-600 group-hover:scale-110 transition-transform duration-200" />
                    <span>Get now !</span>
                </div>
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
            </motion.button>
        </Link>
    );
}