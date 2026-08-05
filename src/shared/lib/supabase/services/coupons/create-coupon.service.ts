import { SupabaseClient } from "@supabase/supabase-js";

import { LicenseType } from "@/shared/config/licensing";
import { PlanType } from "@/shared/config/plans";

import { generateCouponCode } from "./generate-coupon-code.service";

interface CreateCouponParams {
    supabase: SupabaseClient;

    systemId: string;
    createdBy: string;

    code?: string;
    generateCode?: boolean;

    discountType: "PERCENT" | "FIXED";
    discountValue: number;

    maxDiscount?: number;

    licenseType?: LicenseType;
    plan?: PlanType;

    minOrderAmount?: number;

    maxUses?: number | null;
    maxUsesPerUser?: number;

    oneUsePerSystem?: boolean;

    startsAt?: Date;
    expiresAt?: Date;

    isActive?: boolean;
}

export async function createCoupon({
    supabase,

    systemId,
    createdBy,

    code,
    generateCode = false,

    discountType,
    discountValue,

    maxDiscount,

    licenseType,
    plan,

    minOrderAmount = 0,

    maxUses = null,
    maxUsesPerUser = 1,

    oneUsePerSystem = true,

    startsAt,
    expiresAt,

    isActive = true,
}: CreateCouponParams) {
    // ---------------------------------
    // Basic Validation
    // ---------------------------------

    if (!generateCode && (!code || !code.trim())) {
        throw new Error(
            "You must provide a coupon code or enable auto-generation."
        );
    }

    if (discountType === "PERCENT") {
        if (discountValue <= 0 || discountValue > 100) {
            throw new Error(
                "Percentage discount must be between 1 and 100."
            );
        }
    }

    if (discountType === "FIXED") {
        if (discountValue <= 0) {
            throw new Error(
                "Fixed discount must be greater than zero."
            );
        }
    }

    const now = new Date();

    if (startsAt && startsAt < now) {
        throw new Error(
            "Start date cannot be in the past."
        );
    }

    if (expiresAt && expiresAt <= now) {
        throw new Error(
            "Expiration date must be in the future."
        );
    }

    if (
        startsAt &&
        expiresAt &&
        expiresAt <= startsAt
    ) {
        throw new Error(
            "Expiration date must be after the start date."
        );
    }

    // ---------------------------------
    // Validate System Ownership
    // ---------------------------------

    const { data: system, error: systemError } =
        await supabase
            .from("systems")
            .select("id, owner_id")
            .eq("id", systemId)
            .single();

    if (systemError || !system) {
        throw new Error("System not found.");
    }

    if (system.owner_id !== createdBy) {
        throw new Error(
            "You are not allowed to create coupons for this system."
        );
    }

    // ---------------------------------
    // Resolve Coupon Code
    // ---------------------------------

    let couponCode = "";

    if (generateCode) {
        let attempts = 0;

        while (attempts < 5) {
            attempts++;

            const generated =
                await generateCouponCode();

            const { data: existing } =
                await supabase
                    .from("coupons")
                    .select("id")
                    .eq("code", generated)
                    .maybeSingle();

            if (!existing) {
                couponCode = generated;
                break;
            }
        }

        if (!couponCode) {
            throw new Error(
                "Failed to generate a unique coupon code."
            );
        }
    } else {
        couponCode = code!.trim().toUpperCase();

        const { data: existing } =
            await supabase
                .from("coupons")
                .select("id")
                .eq("code", couponCode)
                .maybeSingle();

        if (existing) {
            throw new Error(
                "Coupon code already exists."
            );
        }
    }

    // ---------------------------------
    // Insert Coupon
    // ---------------------------------

    const insert = {
        code: couponCode,

        is_generated: generateCode,

        system_id: systemId,
        created_by: createdBy,

        discount_type: discountType,
        discount_value: discountValue,

        max_discount: maxDiscount ?? null,

        license_type: licenseType ?? null,

        plan: plan ?? null,

        min_order_amount: minOrderAmount,

        max_uses: maxUses,

        max_uses_per_user: maxUsesPerUser,

        one_use_per_system: oneUsePerSystem,

        starts_at: startsAt ?? null,

        expires_at: expiresAt ?? null,

        is_active: isActive,
    };

    const { data: coupon, error } =
        await supabase
            .from("coupons")
            .insert(insert)
            .select("id")
            .single();

    if (error) {
        if (error.code === "23505") {
            throw new Error(
                "Coupon code already exists."
            );
        }
        // Wrap Supabase/Postgres error into a JS Error so callers receive a
        // consistent Error instance with a useful message.
        // Safely extract a message from the Supabase/Postgrest error object.
        const supabaseErr: { message?: string; error?: string; details?: string } = error;
        const message =
            supabaseErr?.message ?? supabaseErr?.error ?? supabaseErr?.details ??
            JSON.stringify(supabaseErr) ??
            "Failed to insert coupon into database.";

        throw new Error(String(message));
    }

    return coupon;
}
