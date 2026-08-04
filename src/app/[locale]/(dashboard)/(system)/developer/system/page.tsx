'use client';

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useSystem } from "@/shared/lib/hooks";
import { Loader2, Plus, Terminal } from "lucide-react";

export default function Page() {
    const { isLoading, currentSystems, isCreating, createSystem } = useSystem();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">System Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        إدارة الأنظمة والبيئات الخاصة بك
                    </p>
                </div>
            </div>

            {/* Systems List */}
            {currentSystems?.length === 0 ? (
                <div className="border border-dashed rounded-xl p-12 text-center space-y-3">
                    <Terminal className="w-10 h-10 mx-auto text-muted-foreground/60" />
                    <h3 className="font-semibold text-lg">لا توجد أنظمة حالياً</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        قم بإنشاء نظامك الأول للبدء في إدارة مفاتيح الـ API والصلاحيات.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentSystems?.map((system) => (
                        <Link
                            href={`/developer/system/${system.id}`}
                            key={system.id}
                            className="p-5 border rounded-xl bg-card/50 hover:border-primary/50 transition-all space-y-2"
                        >
                            <h3 className="font-semibold text-base">{system.name}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                                {system.description || "بدون وصف"}
                            </p>
                        </Link>
                    ))}
                </div>
            )}
            <Link href="/developer/system/add">
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New System
                </Button>
            </Link>
        </div>
    );
}