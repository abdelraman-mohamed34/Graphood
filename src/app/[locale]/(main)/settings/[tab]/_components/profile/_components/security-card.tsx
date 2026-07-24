"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Shield } from "lucide-react";

export function SecurityCard() {
  const t = useTranslations("settings.profile");

  return (
    <div className="lg:col-span-3 bg-card/30 border border-border/60 rounded-xl p-6 backdrop-blur-sm space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
          <Shield className="h-5 w-5 stroke-[1.5]" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">{t("roleTitle")}</h3>
          <p className="text-xs text-muted-foreground">{t("roleDescription")}</p>
        </div>
      </div>

      <div className="p-4 bg-background/30 border border-border/40 rounded-lg flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-0.5">
          <span className="text-xs font-medium text-foreground px-2.5 py-1 bg-primary/10 text-primary rounded-full">
            OWNER
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("rolePermissionsNotice")}
        </p>
      </div>
    </div>
  );
}