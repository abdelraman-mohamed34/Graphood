"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Check, X, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { PLAN_LIMITS, PlanType } from "@/shared/config/plans";
import {
    licenseTypes,
    LicenseType,
} from "@/shared/config/licensing";
import { useCreateOrder } from "@/features/billing/use-create-order";
import { useSystem } from "@/shared/lib/hooks";
import { useValidateCoupon } from "@/shared/lib/hooks/billings/use-validate-coupon";
import { getPendingOrderAction } from "@/shared/lib/actions/billing/pending-order.action";
import { Link, useRouter } from "@/i18n/navigation";
import { queryKeys } from "@/shared/lib/query";

export default function Page() {
    const params = useParams<{ system_id: string }>();
    const systemId = params.system_id;
    const t = useTranslations("marketplace.purchase");

    const [selectedPlan, setSelectedPlan] = useState<PlanType>("PRO");
    const [selectedLicense, setSelectedLicense] = useState<LicenseType>("SUBSCRIPTION");
    const [usersCount] = useState<number>(1);
    const [couponCode, setCouponCode] = useState("");
    const [preview, setPreview] = useState<{
        originalAmount: number;
        discountAmount: number;
        discountPercentage: number;
        finalAmount: number;
        coupon?: {
            id: string;
            code: string;
        };
    } | null>(null);

    const { system, isLoading, error } = useSystem(systemId);
    const { createOrder, isCreating, cancelOrder, isCancellingOrder } = useCreateOrder();
    const pendingOrderQuery = useQuery({
        queryKey: queryKeys.orders.pendingForSystem(systemId),
        queryFn: () => getPendingOrderAction(systemId),
        enabled: Boolean(systemId),
    });

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
                name: t("plans.starter.name"),
                tagline: t("plans.starter.tagline"),
                description: t("plans.starter.description"),
                monthlyPrice: Number(system.starter_price) || 0,
            },
            {
                id: "PRO" as const,
                name: t("plans.pro.name"),
                tagline: t("plans.pro.tagline"),
                description: t("plans.pro.description"),
                monthlyPrice: Number(system.pro_price) || 0,
            },
            {
                id: "BUSINESS" as const,
                name: t("plans.business.name"),
                tagline: t("plans.business.tagline"),
                description: t("plans.business.description"),
                monthlyPrice: Number(system.business_price) || 0,
            },
        ];
    }, [system, t]);

    const licenseLabel = (type: LicenseType) => t(`licenses.${type.toLowerCase()}.label`);
    const licenseShortDescription = (type: LicenseType) => t(`licenses.${type.toLowerCase()}.shortDescription`);
    const licenseDescription = (type: LicenseType) => t(`licenses.${type.toLowerCase()}.description`);

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

    const clearCoupon = () => {
        reset();
        setPreview(null);
    };

    const handleCouponCodeChange = (value: string) => {
        const normalizedValue = value.toUpperCase();
        setCouponCode(normalizedValue);
        if (preview?.coupon?.code && normalizedValue !== preview.coupon.code) {
            setPreview(null);
        }
    };

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
                toast.error(t("feedback.orderFailed"));
                return;
            }

            if (result.isExisting) {
                toast.info(t("pendingOrder.redirecting"));
            } else {
                toast.success(t("feedback.orderCreated"));
            }
            router.push(`/marketplace/checkout/${result.orderId}`);
        } catch {
            toast.error(t("feedback.genericError"));
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        try {
            await cancelOrder({ orderId, systemId });
            toast.success(t("pendingOrder.cancelled"));
        } catch {
            toast.error(t("pendingOrder.cancelFailed"));
        }
    };

    const getFeaturesList = (planKey: PlanType) => {
        const limits = PLAN_LIMITS[planKey];
        if (!limits) return [];

        return [
            { text: t("features.admins", { count: limits.maxAdmins }), included: true },
            { text: limits.hasReports ? t("features.advancedReports") : t("features.basicAnalytics"), included: limits.hasReports },
            { text: limits.hasWordAssistant ? t("features.wordAssistant") : t("features.noWordAssistant"), included: limits.hasWordAssistant },
            { text: limits.api ? t("features.fullApiAccess") : t("features.noApiAccess"), included: limits.api },
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
                {t("loadError")}
            </div>
        );
    }

    const pendingOrder = pendingOrderQuery.data;

    return (
        <div className="flex min-h-screen w-full justify-center bg-background pt-8 pb-16">
            <div className="w-full max-w-4xl mx-auto p-6 font-sans">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                    {t("title")}
                </h2>

                {pendingOrder && (
                    <div className="mb-8 flex flex-col gap-4 rounded border border-amber-500/25 bg-amber-500/10 p-4 text-start sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                            <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                            <div className="min-w-0">
                                <p className="font-semibold text-foreground">{t("pendingOrder.title")}</p>
                                <p className="mt-1 text-sm text-muted-foreground">{t("pendingOrder.description")}</p>
                            </div>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                            <Link href={`/marketplace/checkout/${pendingOrder.id}`}>
                                <button
                                    type="button"
                                    className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
                                >
                                    {t("pendingOrder.resume")}
                                </button>
                            </Link>
                            <button
                                type="button"
                                disabled={isCancellingOrder}
                                onClick={() => handleCancelOrder(pendingOrder.id)}
                                className="rounded border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                            >
                                {isCancellingOrder ? t("pendingOrder.cancelling") : t("pendingOrder.cancel")}
                            </button>
                        </div>
                    </div>
                )}

                {/* License Types Selection */}
                <div className="mb-5">
                    <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                        {t("chooseLicense")}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {licenseTypes.map((type) => {
                            const isSelected = selectedLicense === type;
                            return (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => {
                                        setSelectedLicense(type);
                                        clearCoupon();
                                    }}
                                    className={`border rounded p-4 text-start transition-all bg-white ${isSelected
                                        ? "border-neutral-900 dark:border-white dark:ring-white bg-neutral-50/50 dark:bg-neutral-900/50"
                                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                                        }`}
                                >
                                    <div className="font-semibold text-neutral-900 dark:text-white text-sm">
                                        {licenseLabel(type)}
                                    </div>
                                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                        {licenseShortDescription(type)}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {selectedLicense === "SUBSCRIPTION" && (
                    <div className="w-full my-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 border border-white/10 rounded overflow-visible shadow-sm bg-white">
                            {plans.map((plan, index) => {
                                const isSelected = selectedPlan === plan.id;
                                const features = getFeaturesList(plan.id);

                                return (
                                    <div
                                        key={plan.id}
                                        onClick={() => {
                                            setSelectedPlan(plan.id);
                                            clearCoupon();
                                        }}
                                        className={`relative cursor-pointer p-6 sm:p-8 transition-all duration-200 flex flex-col justify-between  ${isSelected
                                            ? "border-primary border-1"
                                            : "bg-transparent hover:bg-white/[0.03]"
                                            }`}
                                    >
                                        <div>
                                            {/* Target Audience Pill */}
                                            <div className="inline-block px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-neutral-600 font-medium mb-4">
                                                {plan.tagline || "For growing teams"}
                                            </div>

                                            {/* Plan Title */}
                                            <h3 className="text-2xl sm:text-3xl font-normal mb-2">
                                                {plan.name}
                                            </h3>

                                            <p className="text-xs text-neutral-400 font-light leading-relaxed min-h-[36px] mb-6">
                                                {plan.description || "Get started with interactive components and full ecosystem access."}
                                            </p>

                                            {/* Price Display */}
                                            <div className="mb-6">
                                                <div className="text-3xl sm:text-4xl font-light tracking-tight w-full flex justify-between items-end">
                                                    <div>
                                                        {(Number(plan.monthlyPrice) || 0).toFixed(0)}{" "}
                                                        <span className="text-sm font-normal text-neutral-400">EGP</span>
                                                    </div>
                                                    <span className="text-[11px] text-neutral-500 mt-1">
                                                        {t("perMonthShort")}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-xs font-semibold mb-4">
                                                {index === 0
                                                    ? "Includes:"
                                                    : `Everything in ${plans[index - 1]?.name || "previous"}, plus:`}
                                            </div>

                                            {/* Features List */}
                                            <ul className="space-y-3">
                                                {features.map((feature, idx) => (
                                                    <li
                                                        key={idx}
                                                        className={`flex items-start gap-2.5 text-xs font-light leading-snug ${feature.included
                                                            ? "text-neutral-500"
                                                            : "text-neutral-800 line-through"
                                                            }`}
                                                    >
                                                        {feature.included ? (
                                                            <Check className="w-3.5 h-3.5 text-white flex-shrink-0 mt-0.5 stroke-[2]" />
                                                        ) : (
                                                            <X className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0 mt-0.5 stroke-[2]" />
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
                    </div>
                )}

                {/* Reseller Details */}
                {selectedLicense === "RESELLER" && (
                    <div className="mb-8">
                        <div className="rounded border border-neutral-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                {licenseLabel("RESELLER")}
                            </h3>
                            <p className="text-xs text-neutral-500 mt-1">
                                {licenseShortDescription("RESELLER")}
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
                        <div className="rounded border border-neutral-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                {licenseLabel("EXCLUSIVE")}
                            </h3>
                            <p className="text-xs text-neutral-500 mt-1">
                                {licenseShortDescription("EXCLUSIVE")}
                            </p>
                            <div className="mt-6 text-3xl font-bold text-neutral-900 dark:text-white">
                                ${(Number(system.exclusive_price) || 0).toFixed(2)}
                            </div>
                        </div>
                    </div>
                )}

                <div className="mb-8">
                    <label className="text-sm font-medium text-neutral-900 dark:text-white">
                        {t("coupon.label")}
                    </label>

                    <div className="mt-2 flex gap-2">
                        <input
                            value={couponCode}
                            onChange={(e) => handleCouponCodeChange(e.target.value)}
                            placeholder="SUMMER50"
                            className="flex-1 rounded-lg border bg-white border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
                        />

                        <button
                            type="button"
                            disabled={!couponCode || isValidating}
                            className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-950 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
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
                                    toast.error(t("feedback.invalidCoupon"));
                                    setPreview(null);
                                    return;
                                }

                                setPreview(result.data || null);
                                toast.success(t("feedback.couponApplied"));
                            }}
                        >
                            {isValidating ? (
                                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                            ) : (
                                t("coupon.apply")
                            )}
                        </button>
                    </div>
                </div>

                {/* Summary Box */}
                <div className="mb-8 bg-transparent pb-6">
                    <div className="space-y-5">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                {t("summary.licenseMode")}
                            </p>
                            <p className="font-medium text-neutral-900 dark:text-white mt-1">
                                {licenseLabel(selectedLicense)}
                            </p>
                            <p className="mt-1 text-xs text-neutral-500">
                                {licenseDescription(selectedLicense)}
                            </p>
                        </div>

                        {selectedLicense === "SUBSCRIPTION" && activePlan && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                    {t("summary.selectedTier")}
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
                                    <span>{t("summary.subtotal")}</span>
                                    <span>
                                        {(Number(preview.originalAmount) || 0).toFixed(2)} {system.currency}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm text-green-600 dark:text-green-500">
                                    <span>{t("summary.discount", { percentage: preview.discountPercentage })}</span>
                                    <span>
                                        -{(Number(preview.discountAmount) || 0).toFixed(2)} {system.currency}
                                    </span>
                                </div>
                            </>
                        )}

                        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                    {t("summary.totalAmount")}
                                </p>
                                <p className="text-xs text-neutral-500 mt-0.5">
                                    {selectedLicense === "SUBSCRIPTION"
                                        ? t("summary.recurringFee")
                                        : t("summary.oneTimePurchase")}
                                </p>
                            </div>

                            <div className="text-end">
                                <div className="text-3xl font-bold text-neutral-900 dark:text-white">
                                    {displayPrice} {system.currency}
                                </div>
                                {selectedLicense === "SUBSCRIPTION" && (
                                    <div className="text-xs text-neutral-400">
                                        {t("perMonth")}
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
                        className="w-full sm:w-auto px-8 py-5 bg-primary text-white font-semibold text-xs rounded flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                {t("processing")}
                            </>
                        ) : (
                            <>
                                {t("continueToCheckout", { price: displayPrice, currency: system.currency })}
                                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
