import { SupabaseClient } from "@supabase/supabase-js";

import { LicenseType } from "@/shared/config/licensing";
import { PlanType } from "@/shared/config/plans";
import { getCouponByCode } from "./get-coupon-by-code.service";

interface ValidateCouponParams {
    supabase: SupabaseClient;

    code: string;

    profileId: string;
    systemId: string;

    amount: number;

    licenseType: LicenseType;
    plan?: PlanType;
}

export interface ValidatedCouponResult {
    coupon: Awaited<ReturnType<typeof getCouponByCode>>;

    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
}

export async function validateCoupon({
    supabase,

    code,

    profileId,
    systemId,

    amount,

    licenseType,
    plan,
}: ValidateCouponParams): Promise<ValidatedCouponResult> {
    if (!code.trim()) {
        throw new Error("Coupon code is required.");
    }

    if (amount <= 0) {
        throw new Error("Invalid order amount.");
    }

    const coupon = await getCouponByCode(supabase, code);

    if (!coupon) {
        throw new Error("Coupon not found.");
    }

    //----------------------------------
    // Active
    //----------------------------------

    if (!coupon.is_active) {
        throw new Error("Coupon is inactive.");
    }

    //----------------------------------
    // Date Validation
    //----------------------------------

    const now = new Date();

    if (coupon.starts_at) {
        const startsAt = new Date(coupon.starts_at);

        if (startsAt > now) {
            throw new Error("Coupon is not active yet.");
        }
    }

    if (coupon.expires_at) {
        const expiresAt = new Date(coupon.expires_at);

        if (expiresAt < now) {
            throw new Error("Coupon has expired.");
        }
    }

    //----------------------------------
    // System Validation
    //----------------------------------

    if (coupon.system_id !== systemId) {
        throw new Error("Coupon does not belong to this system.");
    }

    //----------------------------------
    // License Validation
    //----------------------------------

    if (
        coupon.license_type &&
        coupon.license_type !== licenseType
    ) {
        throw new Error(
            "Coupon is not valid for this license."
        );
    }

    //----------------------------------
    // Plan Validation
    //----------------------------------

    if (coupon.plan) {
        if (!plan) {
            throw new Error(
                "Coupon requires a subscription plan."
            );
        }

        if (coupon.plan !== plan) {
            throw new Error(
                "Coupon is not valid for this plan."
            );
        }
    }

    //----------------------------------
    // Minimum Order
    //----------------------------------

    if (amount < coupon.min_order_amount) {
        throw new Error(
            `Minimum order amount is ${coupon.min_order_amount}.`
        );
    }

    //----------------------------------
    // Total Uses
    //----------------------------------

    if (
        coupon.max_uses !== null &&
        coupon.used_count >= coupon.max_uses
    ) {
        throw new Error("Coupon usage limit reached.");
    }

    //----------------------------------
    // User Uses
    //----------------------------------

    const { count: userUsageCount, error: usageError } =
        await supabase
            .from("coupon_usages")
            .select("*", {
                head: true,
                count: "exact",
            })
            .eq("coupon_id", coupon.id)
            .eq("profile_id", profileId);

    if (usageError) {
        throw usageError;
    }

    if (
        userUsageCount !== null &&
        userUsageCount >= coupon.max_uses_per_user
    ) {
        throw new Error(
            "You have already used this coupon the maximum number of times."
        );
    }

    //----------------------------------
    // One Use Per System
    //----------------------------------

    if (coupon.one_use_per_system) {
        const { data: existingUsage, error } =
            await supabase
                .from("coupon_usages")
                .select("id")
                .eq("coupon_id", coupon.id)
                .eq("profile_id", profileId)
                .eq("system_id", systemId)
                .maybeSingle();

        if (error) {
            throw error;
        }

        if (existingUsage) {
            throw new Error(
                "You have already used this coupon for this system."
            );
        }
    }

    //----------------------------------
    // Calculate Discount
    //----------------------------------

    let discountAmount = 0;

    if (coupon.discount_type === "PERCENT") {
        discountAmount =
            (amount * coupon.discount_value) / 100;

        if (
            coupon.max_discount !== null &&
            discountAmount > coupon.max_discount
        ) {
            discountAmount = coupon.max_discount;
        }
    } else {
        discountAmount = coupon.discount_value;
    }

    //----------------------------------
    // Never exceed order amount
    //----------------------------------

    if (discountAmount > amount) {
        discountAmount = amount;
    }

    const finalAmount = Math.max(
        0,
        amount - discountAmount
    );

    return {
        coupon,

        originalAmount: amount,

        discountAmount,

        finalAmount,
    };
}