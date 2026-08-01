"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, X, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PLAN_LIMITS, PlanType } from "@/shared/config/plans";
import {
    licenseTypes,
    LICENSE_MODELS,
    LicenseType,
} from "@/shared/config/licensing";
import { useCreateOrder } from "@/features/billing/use-create-order";
import { useSystem } from "@/shared/lib/hooks";
import { useValidateCoupon } from "@/shared/lib/hooks/billings/use-validate-coupon";

export default function Page() {
    const params = useParams();
    const systemId = (params?.system_id || params?.id) as string;

    const [selectedPlan, setSelectedPlan] = useState<PlanType>("PRO");
    const [selectedLicense, setSelectedLicense] = useState<LicenseType>("SUBSCRIPTION");
    const [usersCount] = useState<number>(1);
    const [couponCode, setCouponCode] = useState("");
    const [preview, setPreview] = useState<{
        originalAmount: number;
        discountAmount: number;
        finalAmount: number;
        coupon?: {
            id: string;
            code: string;
        };
    } | null>(null);

    const { system, isLoading, error } = useSystem(systemId);
    const { createOrder, isCreating } = useCreateOrder();
    const {
        validateCoupon,
        isValidating,
        reset,
    } = useValidateCoupon();

    const router = useRouter();

    const plans = useMemo(() => {
        if (!system) return [];
        return [
            {
                id: "STARTER" as const,
                name: "Starter",
                tagline: "Perfect for individuals",
                description:
                    "Ideal for freelancers and personal projects. Includes essential features to get started quickly.",
                monthlyPrice: Number(system.starter_price) || 0,
            },
            {
                id: "PRO" as const,
                name: "Pro",
                tagline: "Best for growing businesses",
                description:
                    "Designed for startups and growing teams with advanced features, reports, and API access.",
                monthlyPrice: Number(system.pro_price) || 0,
            },
            {
                id: "BUSINESS" as const,
                name: "Business",
                tagline: "Built for organizations",
                description:
                    "Complete solution for companies that need maximum scalability, collaboration, and enterprise capabilities.",
                monthlyPrice: Number(system.business_price) || 0,
            },
        ];
    }, [system]);

    const activePlan = useMemo(() => {
        return plans.find((p) => p.id === selectedPlan) || plans[1];
    }, [plans, selectedPlan]);

    const totalPrice = useMemo(() => {
        if (!system) return "0.00";

        if (selectedLicense === "SUBSCRIPTION") {
            const price = activePlan ? Number(activePlan.monthlyPrice) || 0 : 0;
            return (price * usersCount).toFixed(2);
        }

        if (selectedLicense === "RESELLER") {
            return (Number(system.reseller_price) || 0).toFixed(2);
        }

        return (Number(system.exclusive_price) || 0).toFixed(2);
    }, [selectedLicense, activePlan, usersCount, system]);

    const displayPrice = preview
        ? (Number(preview.finalAmount) || 0).toFixed(2)
        : totalPrice;

    useEffect(() => {
        reset();
        setPreview(null);
    }, [selectedPlan, selectedLicense, reset]);

    // Clear preview only if the input code changes from the successfully applied coupon code
    useEffect(() => {
        if (preview?.coupon?.code && couponCode !== preview.coupon.code) {
            setPreview(null);
        }
    }, [couponCode, preview]);

    const handleOrder = async () => {
        try {
            const payload =
                selectedLicense === "SUBSCRIPTION"
                    ? {
                        systemId,
                        licenseType: "SUBSCRIPTION" as const,
                        plan: selectedPlan,
                        couponCode: couponCode.trim() || undefined,
                    }
                    : {
                        systemId,
                        licenseType: selectedLicense,
                        couponCode: couponCode.trim() || undefined,
                    };

            const result = await createOrder(payload);

            if (!result?.success) {
                toast.error(
                    typeof result?.error === "string"
                        ? result.error
                        : "Failed to create order."
                );
                return;
            }

            toast.success("Order created successfully.");
            router.push(`/marketplace/checkout/${result.orderId}`);
        } catch (err) {
            console.error(err);
            toast.error(
                err instanceof Error ? err.message : "Something went wrong."
            );
        }
    };

    const getFeaturesList = (planKey: PlanType) => {
        const limits = PLAN_LIMITS[planKey];
        if (!limits) return [];

        return [
            { text: `Up to ${limits.maxAdmins} Admin${limits.maxAdmins > 1 ? "s" : ""}`, included: true },
            { text: limits.hasReports ? "Advanced Reports" : "Basic Analytics", included: limits.hasReports },
            { text: limits.hasWordAssistant ? "Word Assistant Included" : "No Word Assistant", included: limits.hasWordAssistant },
            { text: limits.api ? "Full API Access" : "No API Access", included: limits.api },
        ];
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
            </div>
        );
    }

    if (error || !system) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] text-neutral-500 text-sm">
                Failed to load system details. Please try again.
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen flex justify-center pt-8 pb-16">
            <div className="w-full max-w-4xl mx-auto p-6 font-sans">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                    Select a Plan
                </h2>

                {/* License Types Selection */}
                <div className="mb-8">
                    <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                        Choose License Type
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {licenseTypes.map((type) => {
                            const isSelected = selectedLicense === type;
                            const model = LICENSE_MODELS[type];

                            return (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setSelectedLicense(type)}
                                    className={`rounded-xl border p-4 text-left transition-all ${isSelected
                                        ? "border-neutral-900 dark:border-white ring-1 ring-neutral-900 dark:ring-white bg-neutral-50/50 dark:bg-neutral-900/50"
                                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                                        }`}
                                >
                                    <div className="font-semibold text-neutral-900 dark:text-white text-sm">
                                        {model?.label}
                                    </div>
                                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                        {model?.shortDescription}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Subscription Plans */}
                {selectedLicense === "SUBSCRIPTION" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {plans.map((plan) => {
                            const isSelected = selectedPlan === plan.id;
                            const features = getFeaturesList(plan.id);

                            return (
                                <div
                                    key={plan.id}
                                    onClick={() => setSelectedPlan(plan.id)}
                                    className={`relative cursor-pointer rounded-2xl p-5 transition-all duration-200 border flex flex-col justify-between ${isSelected
                                        ? "border-neutral-900 dark:border-white ring-1 ring-neutral-900 dark:ring-white bg-white dark:bg-neutral-900 shadow-sm"
                                        : "border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/40 hover:border-neutral-300 dark:hover:border-neutral-700"
                                        }`}
                                >
                                    <div>
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="font-semibold text-neutral-900 dark:text-white text-base">
                                                    {plan.name}
                                                </h3>
                                                <p className="text-xs text-neutral-400">
                                                    {plan.tagline}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-base font-bold text-neutral-900 dark:text-white">
                                                    ${(Number(plan.monthlyPrice) || 0).toFixed(2)}
                                                </div>
                                                <div className="text-[11px] text-neutral-400">/mo</div>
                                            </div>
                                        </div>

                                        <ul className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                                            {features.map((feature, idx) => (
                                                <li
                                                    key={idx}
                                                    className={`flex items-center gap-2 text-xs font-medium ${feature.included
                                                        ? "text-neutral-700 dark:text-neutral-300"
                                                        : "text-neutral-400 dark:text-neutral-600 line-through decoration-neutral-300 dark:decoration-neutral-700"
                                                        }`}
                                                >
                                                    {feature.included ? (
                                                        <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white stroke-[2.5]" />
                                                    ) : (
                                                        <X className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-600 stroke-[2]" />
                                                    )}
                                                    <span>{feature.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Reseller Details */}
                {selectedLicense === "RESELLER" && (
                    <div className="mb-8">
                        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                {LICENSE_MODELS.RESELLER.label}
                            </h3>
                            <p className="text-xs text-neutral-500 mt-1">
                                {LICENSE_MODELS.RESELLER.shortDescription}
                            </p>
                            <div className="mt-6 text-3xl font-bold text-neutral-900 dark:text-white">
                                ${(Number(system.reseller_price) || 0).toFixed(2)}
                            </div>
                        </div>
                    </div>
                )}

                {/* Exclusive Details */}
                {selectedLicense === "EXCLUSIVE" && (
                    <div className="mb-8">
                        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                {LICENSE_MODELS.EXCLUSIVE.label}
                            </h3>
                            <p className="text-xs text-neutral-500 mt-1">
                                {LICENSE_MODELS.EXCLUSIVE.shortDescription}
                            </p>
                            <div className="mt-6 text-3xl font-bold text-neutral-900 dark:text-white">
                                ${(Number(system.exclusive_price) || 0).toFixed(2)}
                            </div>
                        </div>
                    </div>
                )}

                <div className="mb-8">
                    <label className="text-sm font-medium text-neutral-900 dark:text-white">
                        Coupon Code
                    </label>

                    <div className="mt-2 flex gap-2">
                        <input
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="SUMMER50"
                            className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
                        />

                        <button
                            type="button"
                            disabled={!couponCode || isValidating}
                            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            onClick={async () => {
                                const result = await validateCoupon({
                                    systemId,
                                    code: couponCode.trim(),
                                    amount: Number(totalPrice),
                                    licenseType: selectedLicense,
                                    ...(selectedLicense === "SUBSCRIPTION"
                                        ? { plan: selectedPlan }
                                        : {}),
                                });

                                if (!result.success) {
                                    toast.error(
                                        typeof result.error === "string"
                                            ? result.error
                                            : "Invalid coupon."
                                    );
                                    setPreview(null);
                                    return;
                                }

                                setPreview(result.data || null);
                                toast.success("Coupon applied.");
                            }}
                        >
                            {isValidating ? (
                                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                            ) : (
                                "Apply"
                            )}
                        </button>
                    </div>
                </div>

                {/* Summary Box */}
                <div className="mb-8 bg-transparent pb-6">
                    <div className="space-y-5">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                License Mode
                            </p>
                            <p className="font-medium text-neutral-900 dark:text-white mt-1">
                                {LICENSE_MODELS[selectedLicense]?.label}
                            </p>
                            <p className="mt-1 text-xs text-neutral-500">
                                {LICENSE_MODELS[selectedLicense]?.description}
                            </p>
                        </div>

                        {selectedLicense === "SUBSCRIPTION" && activePlan && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                    Selected Tier
                                </p>
                                <p className="font-medium text-neutral-900 dark:text-white mt-1">
                                    {activePlan.name}
                                </p>
                                <p className="text-xs text-neutral-500 mt-0.5">
                                    {activePlan.description}
                                </p>
                            </div>
                        )}

                        {preview && preview.discountAmount > 0 && (
                            <>
                                <div className="flex justify-between text-sm text-neutral-900 dark:text-white">
                                    <span>Subtotal</span>
                                    <span>
                                        {(Number(preview.originalAmount) || 0).toFixed(2)} {system.currency}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm text-green-600 dark:text-green-500">
                                    <span>Coupon ({preview.coupon?.code})</span>
                                    <span>
                                        -{(Number(preview.discountAmount) || 0).toFixed(2)} {system.currency}
                                    </span>
                                </div>
                            </>
                        )}

                        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                    Total Amount
                                </p>
                                <p className="text-xs text-neutral-500 mt-0.5">
                                    {selectedLicense === "SUBSCRIPTION"
                                        ? "Recurring subscription fee"
                                        : "One-time full purchase"}
                                </p>
                            </div>

                            <div className="text-right">
                                <div className="text-3xl font-bold text-neutral-900 dark:text-white">
                                    {displayPrice} {system.currency}
                                </div>
                                {selectedLicense === "SUBSCRIPTION" && (
                                    <div className="text-xs text-neutral-400">
                                        / month
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit CTA */}
                <div className="flex items-center justify-end pt-4 border-t border-neutral-200/60 dark:border-neutral-800">
                    <button
                        onClick={handleOrder}
                        disabled={isCreating}
                        className="w-full sm:w-auto px-8 py-3 bg-neutral-950 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 dark:text-black text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Processing Order...
                            </>
                        ) : (
                            <>
                                Continue to Checkout ({displayPrice} {system.currency})
                                <ArrowRight className="w-3.5 h-3.5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}