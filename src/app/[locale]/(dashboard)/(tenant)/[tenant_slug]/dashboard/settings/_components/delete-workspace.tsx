"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { useTranslations } from "next-intl";

export function DeleteWorkspace() {
    const t = useTranslations("dashboard.settings");
    const [open, setOpen] = useState(false);

    return (
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 p-5">
            <div>
                <h3 className="font-semibold text-destructive">
                    {t("danger.delete.title")}
                </h3>

                <p className="text-sm text-muted-foreground">
                    {t("danger.delete.description")}
                </p>
            </div>

            <AlertDialog
                open={open}
                onOpenChange={setOpen}
            >
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        {t("danger.delete.action")}
                    </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("danger.delete.confirmTitle")}
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            {t("danger.delete.notImplemented")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            {t("cancel")}
                        </AlertDialogCancel>

                        <AlertDialogAction>
                            {t("continue")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
