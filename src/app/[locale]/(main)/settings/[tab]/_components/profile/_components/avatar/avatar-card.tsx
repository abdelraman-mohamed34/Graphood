// src/app/[locale]/(main)/settings/[tab]/_components/profile/_components/avatar/avatar-card.tsx

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { AvatarPreview } from "./avatar-preview";
import { AvatarActions } from "./avatar-actions";
import { AvatarCardSkeleton } from "./avatar-card-skeleton";

import { useProfile } from "@/shared/lib/hooks/profile/use-profile";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
];

export function AvatarCard() {
    const t = useTranslations("settings.profile");
    const locale = useLocale();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const preview = useMemo(
        () => (selectedFile ? URL.createObjectURL(selectedFile) : null),
        [selectedFile]
    );

    const {
        profile,
        isLoading,
        uploadAvatar,
        removeAvatar,
        isUploading,
        isRemoving,
    } = useProfile(locale);

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const resetSelection = useCallback(() => {
        setSelectedFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, []);

    const openFilePicker = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];

            if (!file) return;

            if (!ALLOWED_TYPES.includes(file.type)) {
                toast.error(t("avatarInvalidType"));
                resetSelection();
                return;
            }

            if (file.size > MAX_FILE_SIZE) {
                toast.error(t("avatarTooLarge"));
                resetSelection();
                return;
            }

            setSelectedFile(file);
        },
        [resetSelection, t]
    );

    const handleUpload = useCallback(async () => {
        if (!selectedFile) {
            openFilePicker();
            return;
        }

        await toast.promise(uploadAvatar(selectedFile), {
            loading: t("uploadingAvatar"),
            success: (result) => {
                if (!result.success) {
                    throw new Error();
                }

                resetSelection();

                return t("avatarUploadSuccess");
            },
            error: t("avatarUploadError"),
        });
    }, [
        selectedFile,
        uploadAvatar,
        openFilePicker,
        resetSelection,
        t,
    ]);

    const handleRemove = useCallback(async () => {
        await toast.promise(removeAvatar(), {
            loading: t("removingAvatar"),
            success: (result) => {
                if (!result.success) {
                    throw new Error();
                }

                resetSelection();

                return t("avatarRemoveSuccess");
            },
            error: t("avatarRemoveError"),
        });
    }, [removeAvatar, resetSelection, t]);

    // ⚡ إظهار الـ Skeleton عند التحميل
    if (isLoading) {
        return <AvatarCardSkeleton />;
    }

    return (
        <div className="bg-card/30 border border-border/60 rounded-xl p-6 backdrop-blur-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">
                    {t("avatarTitle")}
                </h3>

                <div className="flex flex-col items-center justify-center py-4 space-y-4">
                    <AvatarPreview
                        image={profile?.avatarUrl ?? null}
                        preview={preview}
                        isLoading={isLoading}
                        onSelect={openFilePicker}
                    />

                    <p className="max-w-[220px] text-center text-xs text-muted-foreground">
                        {t("avatarRequirements")}
                    </p>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/avif"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>
            </div>
            <AvatarActions
                hasAvatar={
                    Boolean(profile?.avatarUrl) || Boolean(selectedFile)
                }
                isUploading={isUploading}
                isRemoving={isRemoving}
                disabled={isUploading || isRemoving}
                onUpload={handleUpload}
                onRemove={handleRemove}
                uploadLabel={
                    selectedFile
                        ? t("avatarUploadBtn")
                        : profile?.avatarUrl
                            ? t("avatarChangeBtn")
                            : t("avatarUploadBtn")
                }
                removeLabel={t("avatarRemoveBtn")}
            />
        </div>
    );
}