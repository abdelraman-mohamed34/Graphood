"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import NotificationSettings from "./_components/notification-settings";
import ProfileSettingsPage from "./_components/profile/page";

export default function TabPage() {
    const params = useParams();
    const t = useTranslations("settings");
    const currentTab = params.tab as string;

    switch (currentTab) {
        case "profile":
            return <ProfileSettingsPage />;
        case "notifications":
            return <NotificationSettings />;

        default:
            return (
                <div className="text-center py-12">
                    <p className="text-sm text-muted-foreground">{t("tabNotFound") || "التبويب المطلوب غير موجود."}</p>
                </div>
            );
    }
}