"use client";

import { TicketPercent, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CouponsEmptyProps {
    onCreateClick: () => void;
}

export default function CouponsEmpty({
    onCreateClick,
}: CouponsEmptyProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 px-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <TicketPercent className="h-8 w-8 text-muted-foreground" />
            </div>

            <h3 className="mt-6 text-xl font-semibold">
                No coupons yet
            </h3>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Coupons help you create promotions and discounts for your
                customers. Create your first coupon to start increasing
                conversions.
            </p>

            <Button
                className="mt-6 gap-2"
                onClick={onCreateClick}
            >
                <Plus className="h-4 w-4" />
                Create Coupon
            </Button>
        </div>
    );
}