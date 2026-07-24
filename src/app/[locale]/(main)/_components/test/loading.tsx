"use client";

import React from "react";
import { motion } from "framer-motion";

function Loading() {
    const dotVariants = {
        initial: { y: "0%", scale: 0.8, opacity: 0.5 },
        animate: { y: "-60%", scale: 1.2, opacity: 1 },
    };

    const containerVariants = {
        initial: { transition: { staggerChildren: 0.2 } },
        animate: { transition: { staggerChildren: 0.2 } },
    };

    return (
        <div className="flex w-full items-center justify-center py-20">
            {/* Container النقاط */}
            <motion.div
                className="flex items-center gap-3"
                variants={containerVariants}
                initial="initial"
                animate="animate"
            >
                {[0, 1, 2].map((index) => (
                    <motion.span
                        key={index}
                        variants={dotVariants}
                        transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                        }}

                        className="h-5 w-5 rounded-full bg-[#ff0080] shadow-[0_0_15px_#ff0080]"
                    />
                ))}
            </motion.div>
        </div>
    );
}

export default React.memo(Loading)