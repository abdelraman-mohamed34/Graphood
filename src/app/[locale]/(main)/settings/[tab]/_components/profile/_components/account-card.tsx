"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { User, Mail, Info } from "lucide-react";

export function AccountCard() {
    const t = useTranslations("settings.profile");

    return (
        <div className="lg:col-span-2 bg-card/30 border border-border/60 rounded-xl p-6 backdrop-blur-sm space-y-6">
            <div className="flex items-center gap-2.5 border-b border-border/40 pb-4">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <User className="h-5 w-5 stroke-[1.5]" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-foreground">{t("accountInfoTitle")}</h3>
                    <p className="text-xs text-muted-foreground">{t("accountInfoDescription")}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">{t("fullNameLabel")}</label>
                    <input
                        type="text"
                        name="fullName"
                        placeholder={t("fullNamePlaceholder")}
                        className="w-full h-10 px-3 bg-background/50 border border-border/80 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors duration-200"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">{t("usernameLabel")}</label>
                    <input
                        type="text"
                        name="username"
                        placeholder={t("usernamePlaceholder")}
                        className="w-full h-10 px-3 bg-background/50 border border-border/80 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors duration-200"
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground">{t("emailLabel")}</label>
                    <div className="relative flex items-center">
                        <Mail className="absolute right-3 h-4 w-4 text-muted-foreground/60 stroke-[1.5]" />
                        <input
                            type="email"
                            disabled
                            value="owner@graphood.com"
                            className="w-full h-10 pr-9 pl-3 bg-muted/30 border border-border/40 rounded-lg text-sm text-muted-foreground cursor-not-allowed select-none"
                        />
                    </div>
                    <p className="text-[11px] text-muted-foreground/60 flex items-center gap-1 mt-1">
                        <Info className="h-3 w-3" />
                        {t("emailDisabledNotice")}
                    </p>
                </div>
            </div>
        </div>
    );
}