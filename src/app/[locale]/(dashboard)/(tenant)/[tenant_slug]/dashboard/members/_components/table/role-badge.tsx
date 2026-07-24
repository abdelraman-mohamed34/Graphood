"use client";

type Props = {
    role: string;
};

export default function RoleBadge({ role }: Props) {
    return (
        <span className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase">
            {role}
        </span>
    );
}