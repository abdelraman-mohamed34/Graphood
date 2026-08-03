"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CouponsHeaderProps {
    onCreateClick: () => void;
}

export default function CouponsHeader({
    onCreateClick,
}: CouponsHeaderProps) {
    return (
        <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">
                    Coupons
                </h1>

                <p className="text-sm text-muted-foreground">
                    Create and manage discount coupons for your system.
                </p>
            </div>

            <Button
                onClick={onCreateClick}
                className="gap-2"
            >
                <Plus className="h-4 w-4" />

                Create Coupon
            </Button>
        </div>
    );
}