"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Save } from "lucide-react";
import { AccountCard } from "./_components/account-card";
import { AvatarCard } from "./_components/avatar-card";
import { SecurityCard } from "./_components/security-card";

export default function ProfileSettingsPage() {
    const t = useTranslations("settings.profile");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        console.log(Object.fromEntries(formData));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <AccountCard />
                <AvatarCard />
                <SecurityCard />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border/40 pt-6">
                <button
                    type="button"
                    className="h-10 px-4 border border-border hover:bg-muted/50 text-sm font-medium text-foreground rounded-lg transition-colors duration-200"
                >
                    {t("cancelBtn") || "إلغاء"}
                </button>
                <button
                    type="submit"
                    className="h-10 px-5 bg-primary hover:bg-primary/95 text-sm font-medium text-primary-foreground rounded-lg flex items-center gap-2 shadow-sm transition-all duration-200"
                >
                    <Save className="h-4 w-4 stroke-[1.8]" />
                    {t("saveBtn") || "حفظ التعديلات"}
                </button>
            </div>

        </form>
    );
}