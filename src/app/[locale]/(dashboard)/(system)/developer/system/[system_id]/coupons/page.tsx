"use client";

import { use, useState } from "react";

import DeveloperDashboardContainer from "@/shared/_components/developer-dashboard-container";
import { useCoupons } from "@/shared/lib/hooks/billings/use-coupons";

import CouponsHeader from "./_components/coupons-header";
import CouponsSkeleton from "./_components/coupons-skeleton";
import CouponsEmpty from "./_components/coupons-empty";
import CouponsList from "./_components/coupons-list";
import { CreateCouponDialog } from "./_components/create-coupon-dialog";

interface CouponsPageProps {
    params: Promise<{
        system_id: string;
    }>;
}

export default function CouponsPage({ params }: CouponsPageProps) {
    const { system_id: systemId } = use(params);

    const [open, setOpen] = useState(false);

    const {
        coupons = [],
        isLoading,
        isCreating,
        isDeleting,
        createCoupon,
        deleteCoupon,
    } = useCoupons(systemId);

    return (
        <DeveloperDashboardContainer className="bg-card text-card-foreground py-6">
            <div className="space-y-6">
                {/* Header Section */}
                <CouponsHeader onCreateClick={() => setOpen(true)} />

                {/* Create Coupon Modal */}
                <CreateCouponDialog
                    open={open}
                    onOpenChange={setOpen}
                    systemId={systemId}
                    createCoupon={createCoupon}
                    isCreating={isCreating}
                />

                {/* Content Section */}
                {isLoading ? (
                    <CouponsSkeleton />
                ) : coupons.length === 0 ? (
                    <CouponsEmpty onCreateClick={() => setOpen(true)} />
                ) : (
                    <CouponsList
                        coupons={coupons}
                        onDelete={(id) => void deleteCoupon(id)}
                        isDeleting={isDeleting}
                    />
                )}
            </div>
        </DeveloperDashboardContainer>
    );
}
