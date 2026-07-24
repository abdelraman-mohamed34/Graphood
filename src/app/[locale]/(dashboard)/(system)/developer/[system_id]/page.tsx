"use client";

import { useSystem } from "@/shared/lib/hooks";
import { use } from "react";

interface PageProps {
    params: Promise<{
        system_id: string;
    }>;
}

export default function page({ params }: PageProps) {
    const { system_id } = use(params);
    const { system, isSingleLoading, error } = useSystem(system_id);
    return (
        <></>
    )
}