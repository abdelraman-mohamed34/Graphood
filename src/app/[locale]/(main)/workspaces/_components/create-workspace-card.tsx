"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { SquarePlus } from "lucide-react";

export function CreateWorkspaceCard() {
    const t = useTranslations("dashboard.welcome");

    return (
        <Link href="/marketplace">
            <Button
                variant="ghost"
                className="group h-full w-full flex flex-col justify-between p-6 bg-card/40 border border-dashed border-border/60 rounded hover:border-primary/60 hover:bg-card/40 hover:shadow-[0_0_20px_-5px_rgba(0,0,0,0.1)] transition-all duration-300 min-h-[160px]"
            >
                <div className="flex items-center justify-start w-full">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        <SquarePlus className="h-4 w-4 stroke-[2]" />
                    </div>
                </div>

                <div className="space-y-2 text-start w-full">
                    <h2 className="text-base font-bold group-hover:text-primary">
                        {t("createWorkspaceTitle") || "Create Workspace"}
                    </h2>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {t("createWorkspaceDesc") || "Start by creating a new workspace to manage your system efficiently."}
                    </p>
                </div>
            </Button>
        </Link>
    );
}
