"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { createClient } from "@/shared/lib/supabase/client";
import { uploadSystemImage, type SystemImageUploadError } from "@/shared/lib/supabase/services/storage/upload-system-image.service";

export interface SystemImageLabels {
    label: string;
    description: string;
    choose: string;
    replace: string;
    remove: string;
    uploading: string;
    previewAlt: string;
    fallback: string;
    errors: Record<SystemImageUploadError, string>;
}

interface SystemImageFieldProps {
    value?: string | null;
    onChange: (url: string) => void | Promise<void>;
    labels: SystemImageLabels;
    disabled?: boolean;
}

export function SystemImageField({ value, onChange, labels, disabled = false }: SystemImageFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(Boolean(value));
    const [error, setError] = useState<string | null>(null);

    const handleFile = async (file?: File) => {
        if (!file) return;
        setError(null);
        setIsUploading(true);
        try {
            const url = await uploadSystemImage(createClient(), file);
            setIsImageLoading(true);
            await onChange(url);
        } catch (uploadError) {
            const code = uploadError instanceof Error ? uploadError.message as SystemImageUploadError : "uploadFailed";
            setError(labels.errors[code] ?? labels.errors.uploadFailed);
        } finally {
            setIsUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const handleRemove = async () => {
        setError(null);
        await onChange("");
        setIsImageLoading(false);
    };

    return (
        <div className="grid gap-4 border border-border bg-card p-4 text-start md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div className="space-y-3">
                <div>
                    <p className="text-sm font-semibold text-foreground">{labels.label}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{labels.description}</p>
                </div>

                <div className="relative aspect-[16/9] max-w-xl overflow-hidden border border-border bg-muted">
                    {value ? (
                        <>
                            {isImageLoading && <div className="absolute inset-0 z-10 grid place-items-center bg-muted"><Loader2 className="size-5 animate-spin text-teal" /></div>}
                            <Image
                                src={value}
                                alt={labels.previewAlt}
                                fill
                                sizes="(max-width: 768px) 100vw, 640px"
                                className="object-cover"
                                onLoad={() => setIsImageLoading(false)}
                                onError={() => setIsImageLoading(false)}
                            />
                        </>
                    ) : (
                        <div className="absolute inset-0 grid place-items-center text-center text-muted-foreground">
                            <div><ImageIcon className="mx-auto size-8" aria-hidden="true" /><p className="mt-2 text-xs">{labels.fallback}</p></div>
                        </div>
                    )}
                </div>
                {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
            </div>

            <div className="flex flex-wrap gap-2 md:flex-col">
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="sr-only"
                    disabled={disabled || isUploading}
                    onChange={(event) => void handleFile(event.target.files?.[0])}
                />
                <button
                    type="button"
                    disabled={disabled || isUploading}
                    onClick={() => inputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-2 border border-foreground bg-foreground px-4 py-2 text-xs font-semibold text-background transition-opacity disabled:opacity-50"
                >
                    {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                    {isUploading ? labels.uploading : value ? labels.replace : labels.choose}
                </button>
                {value && (
                    <button type="button" disabled={disabled || isUploading} onClick={() => void handleRemove()} className="inline-flex items-center justify-center gap-2 border border-border bg-background px-4 py-2 text-xs font-semibold text-destructive disabled:opacity-50">
                        <Trash2 className="size-4" /> {labels.remove}
                    </button>
                )}
            </div>
        </div>
    );
}
