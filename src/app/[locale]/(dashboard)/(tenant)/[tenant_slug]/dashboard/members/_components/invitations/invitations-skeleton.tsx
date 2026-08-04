"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function InvitationsSkeleton() {
    return (
        <div className="space-y-4">
            <div>
                <Skeleton className="h-6 w-52" />
                <Skeleton className="mt-2 h-4 w-80" />
            </div>

            <div className="overflow-hidden rounded-xl border">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="px-6 py-4">
                                <Skeleton className="h-4 w-20" />
                            </th>

                            <th className="px-6 py-4">
                                <Skeleton className="h-4 w-16" />
                            </th>

                            <th className="px-6 py-4">
                                <Skeleton className="h-4 w-20" />
                            </th>

                            <th className="px-4 py-4">
                                <Skeleton className="ms-auto h-4 w-8" />
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {Array.from({ length: 4 }).map((_, index) => (
                            <tr
                                key={index}
                                className="border-b last:border-none"
                            >
                                <td className="px-6 py-4">
                                    <Skeleton className="h-5 w-52" />
                                </td>

                                <td className="px-6 py-4">
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </td>

                                <td className="px-6 py-4">
                                    <Skeleton className="h-5 w-28" />
                                </td>

                                <td className="px-4 py-4">
                                    <Skeleton className="ms-auto h-8 w-8 rounded-md" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
