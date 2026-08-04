"use client";

import { MailXIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export default function InvitationsEmpty() {
    const t = useTranslations("dashboard.members");
    return (
        <div className="rounded-xl border border-dashed py-14">
            <div className="flex flex-col items-center gap-3 text-center">
                <MailXIcon className="h-10 w-10 text-muted-foreground" />

                <div>
                    <h3 className="font-medium">
                        {t("invitations.emptyTitle")}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {t("invitations.emptyDescription")}
                    </p>
                </div>
            </div>
        </div>
    );
}
