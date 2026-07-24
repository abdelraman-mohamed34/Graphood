"use client";

type Props = {
    status: string;
};

export default function StatusBadge({ status }: Props) {
    return (
        <span className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase">
            {status}
        </span>
    );
}