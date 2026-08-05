"use client";

import type { CouponListItem } from "@/shared/lib/supabase/services/coupons/get-coupons.service";

import CouponCard from "./coupon-card";

interface CouponsListProps {
    coupons: CouponListItem[];
    onDelete: (couponId: string) => void | Promise<void>;
    isDeleting?: boolean;
}

export default function CouponsList({
    coupons,
    onDelete,
    isDeleting,
}: CouponsListProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {coupons.map((coupon) => (
                <CouponCard
                    key={coupon.id}
                    coupon={coupon}
                    onDelete={onDelete}
                    isDeleting={isDeleting}
                />
            ))}
        </div>
    );
}
