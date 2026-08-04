"use client";

import { use, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { AlertTriangle, KeyRound, RefreshCw } from "lucide-react";

import { useDeveloperApiKeys } from "@/features/developer/api-keys/hooks/use-developer-api-keys";
import { useSystem } from "@/shared/lib/hooks";

import { ApiKeyDisplay } from "../_components/api-key-display";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import DeveloperDashboardContainer from "@/shared/_components/developer-dashboard-container";

interface PageProps {
    params: Promise<{
        system_id: string;
    }>;
}

export default function Page({ params }: PageProps) {
    const t = useTranslations("developerApiKeys");
    const { system_id } = use(params);

    const { system, isSingleLoading, error } = useSystem(system_id);

    const {
        apiKeys,
        isLoading: isApiKeysLoading,
        regenerateApiKey,
        isRegenerating,
    } = useDeveloperApiKeys(system_id);

    const apiKey = apiKeys[0];
    const [newApiKey, setNewApiKey] = useState<string | null>(null);

    async function handleRegenerate() {
        if (!apiKey) return;

        try {
            const result = await regenerateApiKey(apiKey.id);
            setNewApiKey(result.apiKey);
            toast.success(t("toastRegenerateSuccess"));
        } catch {
            toast.error(t("toastRegenerateError"));
        }
    }

    const displayedApiKey = newApiKey ?? apiKey?.apiKey;
    const isLoading = isSingleLoading || isApiKeysLoading;

    if (isLoading) {
        return (
            <DeveloperDashboardContainer className="bg-card text-card-foreground py-6 space-y-5">
                <div className="flex items-center gap-2 border-b border-border/60 pb-4">
                    <Skeleton className="h-5 w-5 rounded-md" />
                    <Skeleton className="h-6 w-32" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <div className="flex justify-start pt-2">
                        <Skeleton className="h-10 w-40 rounded-lg" />
                    </div>
                </div>
            </DeveloperDashboardContainer>
        );
    }

    if (error || !system) {
        return (
            <DeveloperDashboardContainer className="py-12">
                <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
                    {t("systemNotFound")}
                </div>
            </DeveloperDashboardContainer>
        );
    }

    return (
        <DeveloperDashboardContainer className="bg-card text-card-foreground py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-border/60 pb-4">
                <KeyRound className="h-5 w-5 text-primary shrink-0" />
                <h2 className="text-lg font-semibold tracking-tight">
                    {t("title")}
                </h2>
            </div>

            {apiKey ? (
                <div className="space-y-5">
                    {/* Warning Box */}
                    <Alert className="border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15 text-start">
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0" />
                        <div className="ms-2">
                            <AlertTitle className="font-semibold text-amber-900 dark:text-amber-200">
                                {t("warningTitle")}
                            </AlertTitle>
                            <AlertDescription className="text-amber-800/90 dark:text-amber-300/90 text-xs md:text-sm leading-relaxed mt-1">
                                {t("warningDescription")}
                            </AlertDescription>
                        </div>
                    </Alert>

                    {/* Key Display Component */}
                    {displayedApiKey && (
                        <ApiKeyDisplay apiKey={displayedApiKey} />
                    )}

                    {/* Action Button */}
                    <div className="flex justify-start pt-1">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    disabled={isRegenerating}
                                    className="gap-2 shadow-sm hover:bg-muted/80"
                                >
                                    <RefreshCw
                                        className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""
                                            }`}
                                    />
                                    {isRegenerating
                                        ? t("regeneratingBtn")
                                        : t("regenerateBtn")}
                                </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        {t("dialogTitle")}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t("dialogDescription")}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="gap-2">
                                    <AlertDialogCancel>
                                        {t("cancel")}
                                    </AlertDialogCancel>
                                    <AlertDialogAction onClick={handleRegenerate}>
                                        {t("confirm")}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-border/80 p-8 text-center text-muted-foreground bg-muted/20">
                    {t("noKeysFound")}
                </div>
            )}
        </DeveloperDashboardContainer>
    );
}