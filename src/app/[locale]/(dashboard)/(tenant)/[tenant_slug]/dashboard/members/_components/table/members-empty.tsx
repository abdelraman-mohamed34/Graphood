"use client";

import { CircleUserRoundIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export default function MembersEmpty() {
    const t = useTranslations("dashboard.members");
    return (
        <tr>
            <td
                colSpan={5}
                className="px-6 py-12 text-center text-sm text-muted-foreground"
            >
                <div className="flex flex-col items-center gap-2">
                    <CircleUserRoundIcon className="h-10 w-10 opacity-50" />

                    <p className="font-medium">
                        {t("empty.title")}
                    </p>

                    <p className="text-xs">
                        {t("empty.description")}
                    </p>
                </div>
            </td>
        </tr>
    );
}
