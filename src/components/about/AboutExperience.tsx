"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const AboutHero = dynamic(() => import("./AboutHero"));
const AboutGrid = dynamic(() => import("./AboutGrid"));
const AboutStats = dynamic(() => import("./AboutStats"));

function SectionSkeleton({ className }: { className: string }) {
    return <div className={`animate-pulse border-y border-neutral-200 bg-neutral-100 ${className}`} aria-hidden="true" />;
}

export default function AboutExperience() {
    return (
        <>
            <Suspense fallback={<SectionSkeleton className="min-h-[760px]" />}>
                <AboutHero />
            </Suspense>
            <Suspense fallback={<SectionSkeleton className="min-h-[720px]" />}>
                <AboutGrid />
            </Suspense>
            <Suspense fallback={<SectionSkeleton className="min-h-[360px]" />}>
                <AboutStats />
            </Suspense>
        </>
    );
}
