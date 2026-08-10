"use client";

import { Menu } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import AdminSidebar from "./admin-sidebar";

export default function MobileAdminSidebar() {
    const locale = useLocale();
    const t = useTranslations("adminSidebar");
    const [open, setOpen] = useState(false);
    const isRtl = locale === "ar";

    return (
        <div className="sticky top-0 z-40 border-b bg-background/95 px-4 py-2 backdrop-blur-sm md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        aria-label="Toggle Admin Navigation"
                        aria-expanded={open}
                        aria-controls="mobile-admin-navigation"
                    >
                        <Menu className="size-5" aria-hidden="true" />
                        <span>{t("navigation")}</span>
                    </Button>
                </SheetTrigger>
                <SheetContent
                    id="mobile-admin-navigation"
                    side={isRtl ? "right" : "left"}
                    className="w-[min(20rem,85vw)] gap-0 overflow-hidden p-0"
                >
                    <SheetHeader className="shrink-0 border-b pe-12 text-start">
                        <SheetTitle>{t("navigation")}</SheetTitle>
                    </SheetHeader>
                    <AdminSidebar
                        onNavigate={() => setOpen(false)}
                        className="static top-auto flex h-full min-h-0 w-full border-e-0 pt-4 md:flex"
                    />
                </SheetContent>
            </Sheet>
        </div>
    );
}
