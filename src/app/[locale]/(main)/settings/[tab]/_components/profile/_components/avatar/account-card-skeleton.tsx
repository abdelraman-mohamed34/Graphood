// src/app/[locale]/(main)/settings/[tab]/_components/profile/_components/account-card-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function AccountCardSkeleton() {
    return (
        <div className="lg:col-span-2 rounded-xl border border-border/60 bg-card/30 p-6 backdrop-blur-sm animate-pulse">

            {/* 1️⃣ Header Skeleton */}
            <div className="mb-6 flex items-center gap-2.5 border-b border-border/40 pb-4">
                {/* User Icon Box */}
                <Skeleton className="h-9 w-9 rounded-lg shrink-0" />

                {/* Title & Description */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-56 sm:w-72" />
                </div>
            </div>

            {/* 2️⃣ Form Fields Skeleton */}
            <div className="space-y-5">
                {/* Grid Inputs: First Name & Last Name */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" /> {/* Label */}
                        <Skeleton className="h-10 w-full rounded-md" /> {/* Input */}
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" /> {/* Label */}
                        <Skeleton className="h-10 w-full rounded-md" /> {/* Input */}
                    </div>
                </div>

                {/* Disabled Email Field */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" /> {/* Label */}
                    <Skeleton className="h-10 w-full rounded-md" /> {/* Input */}
                    <Skeleton className="h-3 w-48" /> {/* Info Hint */}
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                    <Skeleton className="h-10 w-28 rounded-md" />
                </div>
            </div>

        </div>
    );
}