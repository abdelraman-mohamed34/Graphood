// src/app/[locale]/(main)/settings/[tab]/_components/profile/_components/avatar/avatar-preview.tsx

"use client";

import { Upload } from "lucide-react";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface AvatarPreviewProps {
    image: string | null;
    preview: string | null;
    isLoading: boolean;
    onSelect: () => void;
}

export function AvatarPreview({
    image,
    preview,
    isLoading,
    onSelect,
}: AvatarPreviewProps) {
    if (isLoading) {
        return (
            <Skeleton className="h-24 w-24 rounded-full" />
        );
    }

    const src = preview ?? image ?? undefined;

    return (
        <button
            type="button"
            onClick={onSelect}
            className="group relative transition-transform hover:scale-[1.02]"
        >
            <Avatar className="h-24 w-24 cursor-pointer border-2 border-dashed border-border transition-colors group-hover:border-primary">
                <AvatarImage
                    src={src}
                    alt="Profile Avatar"
                    className="object-cover"
                />

                <AvatarFallback className="bg-muted">
                    <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </AvatarFallback>
            </Avatar>

            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/20" />
        </button>
    );
}