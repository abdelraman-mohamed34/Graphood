"use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CouponsHeaderProps {
    onCreateClick: () => void;
}

export default function CouponsHeader({
    onCreateClick,
}: CouponsHeaderProps) {
    const t = useTranslations("developerCoupons");

    return (
        <div className="flex flex-col gap-4 items-start border-b pb-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">
                    {t("header.title")}
                </h1>

                <p className="text-sm text-muted-foreground">
                    {t("header.description")}
                </p>
            </div>

            <Button
                onClick={onCreateClick}
                className="gap-2"
            >
                <Plus className="h-4 w-4" />

                {t("header.createButton")}
            </Button>
        </div>
    );
}