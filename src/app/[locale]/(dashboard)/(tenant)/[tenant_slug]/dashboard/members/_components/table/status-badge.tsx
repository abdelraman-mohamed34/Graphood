"use client";
import { useTranslations } from "next-intl";

type Props = {
    status: string;
};

export default function StatusBadge({ status }: Props) {
    const t = useTranslations("dashboard.members");
    const key = `statuses.${status.toLowerCase()}`;
    return (
        <span className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase">
            {t.has(key) ? t(key) : status}
        </span>
    );
}
