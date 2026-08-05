"use client";

import { useParams } from "next/navigation";
import {
    LayoutDashboard,
    KeyRound,
    TicketPercent,
    X,
} from "lucide-react";
import { ReusableSidebar, SidebarItem } from "@/shared/_components/reusable_sidebar";
import { useLocale, useTranslations } from "next-intl";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useSystemNavigation } from "@/shared/_components/system-navigation-provider";
import { Button } from "@/components/ui/button";

export default function SystemSidebar() {
    const params = useParams();
    const systemId = params.system_id as string;
    const t = useTranslations("systemSidebar");
    const locale = useLocale();
    const systemNavigation = useSystemNavigation();

    const navItems: SidebarItem[] = [
        {
            label: t("overview"),
            href: `/developer/systems/${systemId}`,
            icon: LayoutDashboard,
            exact: true,
        },
        {
            label: t("api_keys"),
            href: `/developer/systems/${systemId}/api-keys`,
            icon: KeyRound,
        },
        {
            label: t("coupons"),
            href: `/developer/systems/${systemId}/coupons`,
            icon: TicketPercent,
        },
    ];

    return (
        <>
            <ReusableSidebar items={navItems} />

            <Sheet
                open={systemNavigation?.open ?? false}
                onOpenChange={(open) => systemNavigation?.setOpen(open)}
            >
                <SheetContent
                    side={locale === "ar" ? "right" : "left"}
                    showCloseButton={false}
                    className="isolate w-[min(20rem,85vw)] gap-0 overflow-hidden p-0"
                >
                    <SheetHeader className="relative z-20 flex-row items-center justify-between gap-4 border-b px-4 py-3 text-start">
                        <SheetTitle className="min-w-0 flex-1 truncate text-start">
                            {t("navigation")}
                        </SheetTitle>

                        <SheetClose asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="shrink-0"
                                aria-label={t("close_navigation")}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </SheetClose>
                    </SheetHeader>

                    <div className="relative z-10 min-h-0 flex-1 overflow-y-auto pb-16">
                        <ReusableSidebar
                            items={navItems}
                            onNavigate={() => systemNavigation?.setOpen(false)}
                            className="!static !flex !h-auto !min-h-full !w-full !border-0 !p-2 !pb-6"
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
