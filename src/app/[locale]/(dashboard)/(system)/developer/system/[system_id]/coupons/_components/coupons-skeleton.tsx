"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface CouponsSkeletonProps {
    count?: number;
}

export default function CouponsSkeleton({
    count = 6,
}: CouponsSkeletonProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="rounded-2xl border bg-card p-5"
                >
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-24" />
                        </div>

                        <Skeleton className="h-6 w-16 rounded-full" />
                    </div>

                    <div className="mt-6 space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-5 w-24" />
                        </div>

                        <div className="space-y-2">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-5 w-20" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-between">
                        <Skeleton className="h-9 w-20 rounded-lg" />
                        <Skeleton className="h-9 w-24 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}