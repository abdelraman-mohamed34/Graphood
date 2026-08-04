'use client'

import { Badge as StatusBadge } from "@/components/ui/badge";
import DeveloperDashboardContainer from "@/shared/_components/developer-dashboard-container";
import { useSystem } from "@/shared/lib/hooks";
import { ShieldCheck, Tag } from "lucide-react";
import { use } from "react";

interface PageProps {
    params: Promise<{
        system_id: string;
    }>;
}

export default function Page({ params }: PageProps) {
    const { system_id } = use(params);
    const { system } = useSystem(system_id);

    return (
        <DeveloperDashboardContainer className="bg-yellow-400">
            {/* System Info Card */}
            <div className="border-b-2 bg-card text-card-foreground py-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {system.name}
                        </h1>
                        {system.description && (
                            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
                                {system.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Status & Category Badge Row */}
                <div dir="ltr" className="flex flex-wrap items-center gap-6 pt-3 border-t text-sm">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-muted-foreground">Status:</span>
                        <StatusBadge variant={system.status === "ACTIVE" ? "default" : "secondary"}>
                            {system.status}
                        </StatusBadge>
                    </div>

                    <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-medium text-foreground">{system.category}</span>
                    </div>
                </div>
            </div>
        </DeveloperDashboardContainer>
    );
}