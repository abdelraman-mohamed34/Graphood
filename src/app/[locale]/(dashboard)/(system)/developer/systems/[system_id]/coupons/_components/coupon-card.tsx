"use client";

import { format } from "date-fns";
import {
    Calendar,
    TicketPercent,
    Users,
    Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { CouponListItem } from "@/shared/lib/supabase/services/coupons/get-coupons.service";
import { useTranslations } from "next-intl";

interface CouponCardProps {
    coupon: CouponListItem;
    onDelete: (id: string) => void | Promise<void>;
    isDeleting?: boolean;
}

export default function CouponCard({
    coupon,
    onDelete,
    isDeleting = false,
}: CouponCardProps) {
    const t = useTranslations("developerCoupons.card");
    return (
        <div className="rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <TicketPercent className="h-5 w-5 text-primary" />

                        <h3 className="font-semibold tracking-wide">
                            {coupon.code}
                        </h3>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {coupon.discount_type === "PERCENT"
                            ? t("percentOff", { value: coupon.discount_value })
                            : t("fixedOff", { value: coupon.discount_value })}
                    </p>
                </div>

                <Badge
                    variant={
                        coupon.is_active
                            ? "default"
                            : "secondary"
                    }
                >
                    {coupon.is_active
                        ? t("active")
                        : t("inactive")}
                </Badge>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-muted-foreground">
                        {t("license")}
                    </p>

                    <p className="font-medium">
                        {coupon.license_type ??
                            t("all")}
                    </p>
                </div>

                <div>
                    <p className="text-muted-foreground">
                        {t("plan")}
                    </p>

                    <p className="font-medium">
                        {coupon.plan ?? t("all")}
                    </p>
                </div>

                <div>
                    <p className="text-muted-foreground">
                        {t("uses")}
                    </p>

                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />

                        <span>
                            {coupon.used_count}
                            {coupon.max_uses &&
                                ` / ${coupon.max_uses}`}
                        </span>
                    </div>
                </div>

                <div>
                    <p className="text-muted-foreground">
                        {t("expires")}
                    </p>

                    <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />

                        <span>
                            {coupon.expires_at
                                ? format(
                                    coupon.expires_at,
                                    "dd MMM yyyy"
                                )
                                : t("never")}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end border-t pt-4">
                <Button
                    variant="destructive"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() =>
                        onDelete(coupon.id)
                    }
                >
                    <Trash2 className="mr-2 h-4 w-4" />

                    {t("delete")}
                </Button>
            </div>
        </div>
    );
}
