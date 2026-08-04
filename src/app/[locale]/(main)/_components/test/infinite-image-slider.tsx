import { motion } from 'framer-motion';
import React from 'react';

interface ImageItem {
    id: number;
    src: string;
    alt: string;
    aspectRatio?: string;
}

const images: ImageItem[] = [
    {
        id: 1,
        src: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop",
        alt: "Street view 1",
        aspectRatio: "w-[300px] h-[350px]",
    },
    {
        id: 2,
        src: "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=800&auto=format&fit=crop",
        alt: "Underpass",
        aspectRatio: "w-[450px] h-[350px]",
    },
    {
        id: 3,
        src: "https://images.unsplash.com/photo-1508873696983-2df515122519?q=80&w=800&auto=format&fit=crop",
        alt: "Cyclist portrait",
        aspectRatio: "w-[250px] h-[350px]",
    },
    {
        id: 4,
        src: "https://images.unsplash.com/photo-1471623432079-b009d30b6729?q=80&w=800&auto=format&fit=crop",
        alt: "Reflection",
        aspectRatio: "w-[400px] h-[350px]",
    },
];

const duplicatedImages = [...images, ...images];

function InfiniteImageSlider() {
    return (
        <section className="w-full py-12 overflow-hidden flex items-center">
            <motion.div
                className="flex gap-4 shrink-0"
                animate={{
                    x: ["0%", "-50%"],
                }}
                transition={{
                    ease: "linear",
                    duration: 40,
                    repeat: Infinity,
                }}
            >
                {duplicatedImages.map((img, index) => (
                    <div
                        key={`${img.id}-${index}`}
                        className={`relative shrink-0 overflow-hidden rounded-md bg-neutral-900 ${img.aspectRatio || "w-[300px] h-[350px]"
                            }`}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element -- slider URLs can target arbitrary external hosts */}
                        <img
                            src={img.src}
                            alt={img.alt}
                            className="w-full h-full object-cover grayscale contrast-125 hover:scale-105 transition-transform duration-500 ease-out"
                        />
                    </div>
                ))}
            </motion.div>
        </section>
    );
}

export default React.memo(InfiniteImageSlider)
