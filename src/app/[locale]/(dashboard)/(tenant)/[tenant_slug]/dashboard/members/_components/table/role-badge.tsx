"use client";
import { useTranslations } from "next-intl";

type Props = {
    role: string;
};

export default function RoleBadge({ role }: Props) {
    const t = useTranslations("dashboard.members");
    const key = `roles.${role.toLowerCase()}`;
    return (
        <span className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase">
            {t.has(key) ? t(key) : role}
        </span>
    );
}
