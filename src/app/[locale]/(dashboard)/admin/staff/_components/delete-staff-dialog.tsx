"use client";

import { Loader2, Trash2 } from "lucide-react";
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
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { usePlatformStaff } from "@/shared/lib/hooks/admins/use-platform-staff";
import type { PlatformStaff } from "@/shared/lib/schemas/graphood-staff.schema";

export function DeleteStaffDialog({ staff }: { staff: PlatformStaff }) {
    const t = useTranslations("AdminStaff");
    const [isOpen, setIsOpen] = useState(false);
    const { removeStaff, isRemovingStaff, removingStaffId } = usePlatformStaff();
    const isRemovingThisStaff = isRemovingStaff && removingStaffId === staff.id;

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    disabled={isRemovingStaff}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label={t("delete.trigger", { email: staff.email ?? staff.profileId })}
                >
                    {isRemovingThisStaff ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Trash2 className="size-4" />
                    )}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive">
                        <Trash2 />
                    </AlertDialogMedia>
                    <AlertDialogTitle>{t("delete.title")}</AlertDialogTitle>
                    <AlertDialogDescription className="text-start">
                        {t("delete.description")}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <dl className="rounded-lg border bg-muted/40 p-3 text-sm">
                    <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">{t("fields.email")}</dt>
                        <dd className="truncate font-medium" dir="ltr">
                            {staff.email ?? t("table.emailUnavailable")}
                        </dd>
                    </div>
                    <div className="mt-2 flex justify-between gap-4">
                        <dt className="text-muted-foreground">{t("fields.role")}</dt>
                        <dd className="font-medium">{t(`roles.${staff.role}`)}</dd>
                    </div>
                </dl>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isRemovingThisStaff}>
                        {t("actions.cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        disabled={isRemovingThisStaff}
                        onClick={(event) => {
                            event.preventDefault();
                            void removeStaff(staff.id)
                                .then(() => setIsOpen(false))
                                .catch(() => undefined);
                        }}
                    >
                        {isRemovingThisStaff && <Loader2 className="size-4 animate-spin" />}
                        {t("delete.confirm")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
