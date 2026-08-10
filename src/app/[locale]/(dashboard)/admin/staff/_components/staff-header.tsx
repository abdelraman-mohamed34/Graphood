"use client";

import { ShieldCheck, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePlatformStaff } from "@/shared/lib/hooks/admins/use-platform-staff";
import { AddStaffModal } from "./add-staff-modal";

export function StaffHeader() {
    const t = useTranslations("AdminStaff");
    const { isSuperAdmin } = usePlatformStaff();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1 text-start">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="size-6 shrink-0 text-primary" />
                        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t("header.title")}</h1>
                    </div>
                    <p className="max-w-2xl text-sm text-muted-foreground">{t("header.description")}</p>
                </div>
                {isSuperAdmin && (
                    <Button onClick={() => setIsModalOpen(true)} className="w-full gap-2 sm:w-auto">
                        <UserPlus className="size-4" />
                        {t("header.addStaff")}
                    </Button>
                )}
            </div>
            {isSuperAdmin && (
                <AddStaffModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            )}
        </>
    );
}
