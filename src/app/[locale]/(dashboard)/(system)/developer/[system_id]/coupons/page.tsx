"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import DeveloperDashboardContainer from "@/shared/_components/developer-dashboard-container";
import { useCoupons } from "@/shared/lib/hooks/billings/use-coupons";

import CouponsHeader from "./_components/coupons-header";
import CouponsSkeleton from "./_components/coupons-skeleton";
import CouponsEmpty from "./_components/coupons-empty";
import CouponsList from "./_components/coupons-list";
import { CreateCouponDialog } from "./_components/create-coupon-dialog";

export default function CouponsPage() {
    const params = useParams();
    const systemId = params.system_id as string;

    const [open, setOpen] = useState(false);

    const {
        coupons,
        isLoading,
        isCreating,
        isDeleting,
        createCoupon,
        deleteCoupon,
    } = useCoupons(systemId);

    return (
        <DeveloperDashboardContainer>
            <div className="space-y-8">
                <CouponsHeader
                    onCreateClick={() => setOpen(true)}
                />

                <CreateCouponDialog
                    open={open}
                    onOpenChange={setOpen}
                    systemId={systemId}
                    createCoupon={createCoupon}
                    isCreating={isCreating}
                />

                {isLoading ? (
                    <CouponsSkeleton />
                ) : coupons.length === 0 ? (
                    <CouponsEmpty
                        onCreateClick={() =>
                            setOpen(true)
                        }
                    />
                ) : (
                    <CouponsList
                        coupons={coupons}
                        onDelete={(id) =>
                            void deleteCoupon(id)
                        }
                        isDeleting={isDeleting}
                    />
                )}
            </div>
        </DeveloperDashboardContainer>
    );
}