"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Upload } from "lucide-react";

export function AvatarCard() {
  const t = useTranslations("settings.profile");

  return (
    <div className="bg-card/30 border border-border/60 rounded-xl p-6 backdrop-blur-sm flex flex-col justify-between space-y-6">
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground">{t("avatarTitle")}</h3>
        
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <div className="relative group cursor-pointer w-24 h-24 rounded-full border-2 border-dashed border-border hover:border-primary bg-background/40 flex items-center justify-center transition-all duration-300">
            <div className="flex flex-col items-center text-muted-foreground group-hover:text-primary transition-colors duration-200">
              <Upload className="h-5 w-5 stroke-[1.5]" />
            </div>
          </div>
          <p className="text-xs text-center text-muted-foreground max-w-[200px]">
            {t("avatarRequirements")}
          </p>
        </div>
      </div>

      <button
        type="button"
        className="w-full h-9 border border-border bg-background/60 hover:bg-background text-xs font-medium text-foreground rounded-lg transition-colors duration-200"
      >
        {t("avatarUploadBtn")}
      </button>
    </div>
  );
}