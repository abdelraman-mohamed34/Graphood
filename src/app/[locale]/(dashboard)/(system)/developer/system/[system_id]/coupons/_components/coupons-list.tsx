"use client";

import type { Coupon } from "@/shared/lib/schemas/coupon/coupon.schema";

import CouponCard from "./coupon-card";

interface CouponsListProps {
    coupons: Coupon[];
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