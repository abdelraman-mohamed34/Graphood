// src/app/[locale]/(main)/settings/[tab]/_components/profile/_components/avatar/avatar-card-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function AvatarCardSkeleton() {
    return (
        <div className="bg-card/30 border border-border/60 rounded-xl p-6 backdrop-blur-sm flex flex-col justify-between space-y-6 animate-pulse">
            <div className="space-y-4">
                {/* Title Skeleton */}
                <Skeleton className="h-4 w-28" />

                {/* Avatar Preview & Text Wrapper */}
                <div className="flex flex-col items-center justify-center py-4 space-y-4">
                    {/* Circle Avatar Skeleton */}
                    <Skeleton className="h-28 w-28 rounded-full" />

                    {/* Requirements Text Skeleton (2 lines) */}
                    <div className="flex flex-col items-center gap-1.5 pt-1">
                        <Skeleton className="h-3 w-44" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
            </div>

            {/* Actions Buttons Skeleton */}
            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <Skeleton className="h-10 w-full rounded-md sm:flex-1" />
                <Skeleton className="h-10 w-full rounded-md sm:flex-1" />
            </div>
        </div>
    );
}