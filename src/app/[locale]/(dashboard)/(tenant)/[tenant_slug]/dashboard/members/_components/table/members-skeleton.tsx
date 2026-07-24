"use client";

import { Skeleton } from "@/components/ui/skeleton";

type Props = {
    rows?: number;
};

export default function MembersSkeleton({
    rows = 5,
}: Props) {
    return (
        <>
            {Array.from({ length: rows }).map((_, index) => (
                <tr key={index}>
                    <td className="px-6 py-4">
                        <Skeleton className="h-5 w-40" />
                    </td>

                    <td className="px-6 py-4">
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </td>

                    <td className="px-6 py-4">
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </td>

                    <td className="px-6 py-4">
                        <Skeleton className="h-5 w-36" />
                    </td>

                    <td className="px-4 py-4">
                        <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                    </td>
                </tr>
            ))}
        </>
    );
}