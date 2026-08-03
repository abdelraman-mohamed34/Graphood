"use client";

import { useDeveloperApiKeys } from "@/features/developer/api-keys/hooks/use-developer-api-keys";
import { useSystem } from "@/shared/lib/hooks";
import { use, useState } from "react";

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

import {
    AlertTriangle,
    KeyRound,
    RefreshCw,
} from "lucide-react";

import { toast } from "sonner";
import DeveloperDashboardContainer from "@/shared/_components/developer-dashboard-container";

interface PageProps {
    params: Promise<{
        system_id: string;
    }>;
}

export default function Page({ params }: PageProps) {
    const { system_id } = use(params);

    const {
        system,
        isSingleLoading,
        error,
    } = useSystem(system_id);

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
            toast.success("API Key regenerated successfully");
        } catch {
            toast.error("Failed to regenerate API Key");
        }
    }

    const displayedApiKey = newApiKey ?? apiKey?.apiKey;
    const isLoading = isSingleLoading || isApiKeysLoading;

    if (isLoading) {
        return (
            <div className="mx-auto max-w-5xl space-y-6 p-8">
                {/* System Header Skeleton */}
                <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-full max-w-xl" />
                    <div className="flex gap-4 pt-2">
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-6 w-32 rounded-full" />
                    </div>
                </div>

                {/* API Key Skeleton */}
                <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
                    <Skeleton className="h-7 w-32" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    if (error || !system) {
        return (
            <div className="flex min-h-[400px] items-center justify-center p-6">
                <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
                    System not found or failed to load.
                </div>
            </div>
        );
    }

    return (
        <DeveloperDashboardContainer className="bg-card text-card-foreground py-6 space-y-5">

            <div className="flex items-center gap-2 border-b pb-4">
                <KeyRound className="h-5 w-5 text-primary shrink-0" />
                <h2 className="text-lg font-semibold tracking-tight">
                    API Key
                </h2>
            </div>

            {apiKey ? (
                <div className="space-y-4">
                    {/* Warning Box */}
                    <Alert dir="ltr" className="border-amber-500/30 bg-amber-500/10 text-left">
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                        <AlertTitle className="font-semibold text-amber-900 dark:text-amber-200">
                            Keep your API Key private
                        </AlertTitle>
                        <AlertDescription className="text-amber-800/90 dark:text-amber-300/90 text-xs md:text-sm">
                            This key grants access to your APIs. Never expose it in frontend code, public repositories, or client applications. If compromised, regenerate it immediately.
                        </AlertDescription>
                    </Alert>

                    {/* Key Display Component */}
                    {displayedApiKey && (
                        <ApiKeyDisplay apiKey={displayedApiKey} />
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end pt-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    disabled={isRegenerating}
                                    className="gap-2"
                                >
                                    <RefreshCw className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
                                    {isRegenerating ? "Regenerating..." : "Regenerate API Key"}
                                </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent dir="ltr" className="text-left">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Regenerate API Key?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        The current API Key will stop working immediately. You will need to update it across all your applications.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleRegenerate}>
                                        Regenerate
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground bg-muted/20">
                    No API Key found for this system.
                </div>
            )}

        </DeveloperDashboardContainer>
    );
}