// src/app/[locale]/(main)/settings/[tab]/_components/profile/_components/avatar/avatar-actions.tsx
"use client";

import { Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AvatarActionsProps {
    hasAvatar: boolean;
    isUploading: boolean;
    isRemoving: boolean;
    disabled?: boolean;
    onUpload: () => void;
    onRemove: () => void;
    uploadLabel: string;
    removeLabel: string;
}

export function AvatarActions({
    hasAvatar,
    isUploading,
    isRemoving,
    disabled,
    onUpload,
    onRemove,
    uploadLabel,
    removeLabel,
}: AvatarActionsProps) {
    const loading = isUploading || isRemoving || disabled;

    return (
        <div className="flex flex-col gap-2">
            <Button
                type="button"
                variant="outline"
                onClick={onUpload}
                disabled={loading}
                className="w-full"
            >
                {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Upload className="mr-2 h-4 w-4" />
                )}

                {uploadLabel}
            </Button>

            {hasAvatar && (
                <Button
                    type="button"
                    variant="destructive"
                    onClick={onRemove}
                    disabled={loading}
                    className="w-full"
                >
                    {isRemoving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                    )}

                    {removeLabel}
                </Button>
            )}
        </div>
    );
}