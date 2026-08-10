"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSystems } from "@/shared/lib/hooks/admins/use-systems";

export type SystemAction = "ACCEPT" | "REJECT" | "SUSPEND";

interface SystemActionDialogProps {
    isOpen: boolean;
    systemId: string;
    systemName: string;
    action: SystemAction;
    onClose: () => void;
}

const statusByAction = {
    ACCEPT: "ACTIVE",
    REJECT: "REJECTED",
    SUSPEND: "SUSPENDED",
} as const;

export function SystemActionDialog({
    isOpen,
    systemId,
    systemName,
    action,
    onClose,
}: SystemActionDialogProps) {
    const t = useTranslations("AdminSystems");
    const [reason, setReason] = useState("");
    const { updateStatusMutation, isUpdatingStatus } = useSystems({
        onStatusUpdated: onClose,
    });

    const actionKey = action.toLowerCase() as Lowercase<SystemAction>;

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isUpdatingStatus && onClose()}>
            <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader className="text-start">
                    <AlertDialogTitle>{t(`dialog.${actionKey}.title`)}</AlertDialogTitle>
                    <AlertDialogDescription className="text-start">
                        {t(`dialog.${actionKey}.description`, { system: systemName })}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {(action === "REJECT" || action === "SUSPEND") && (
                    <div className="space-y-2 py-2">
                        <Label htmlFor="system-status-reason" className="block text-start text-xs">
                            {t("dialog.reasonLabel")}
                        </Label>
                        <Textarea
                            id="system-status-reason"
                            maxLength={500}
                            placeholder={t("dialog.reasonPlaceholder")}
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            className="h-24 resize-none text-start text-sm"
                            disabled={isUpdatingStatus}
                        />
                    </div>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isUpdatingStatus}>{t("actions.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                        variant={action === "ACCEPT" ? "default" : "destructive"}
                        disabled={isUpdatingStatus}
                        onClick={(event) => {
                            event.preventDefault();
                            updateStatusMutation.mutate({
                                systemId,
                                status: statusByAction[action],
                                ...(reason.trim() ? { reason: reason.trim() } : {}),
                            });
                        }}
                    >
                        {isUpdatingStatus && <Loader2 className="size-4 animate-spin" />}
                        {isUpdatingStatus ? t("dialog.updating") : t(`dialog.${actionKey}.confirm`)}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
