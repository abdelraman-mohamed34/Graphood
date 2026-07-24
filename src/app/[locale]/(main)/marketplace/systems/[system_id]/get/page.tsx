// src/app/[locale]/(main)/marketplace/systems/[system_id]/get/page.tsx
"use client";
import { useParams } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/client";
import { useState } from "react";
import { Check, X, ArrowRight } from "lucide-react";
import { PLAN_LIMITS, PlanType } from "@/shared/config/plans";
import {
    licenseTypes,
    LICENSE_MODELS,
    LicenseType,
} from "@/shared/config/licensing";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateOrder } from "@/features/billing/use-create-order";
import { useSystem } from "@/shared/lib/hooks";

export default function Page() {
    const params = useParams();
    const systemId = (params?.system_id || params?.id) as string;
    const supabase = createClient();

    const [selectedPlan, setSelectedPlan] = useState<PlanType>("PRO");
    const [selectedLicense, setSelectedLicense] = useState<LicenseType>("SUBSCRIPTION");
    const [usersCount] = useState<number>(1);
    const { createOrder, isCreating } = useCreateOrder();
    const { system, isLoading, error } = useSystem(systemId)
    const router = useRouter()

    const handleOrder = async () => {
        try {
            const result = await createOrder({
                systemId,
                plan: selectedPlan,
                licenseType: selectedLicense,
            });

            if (!result.success) {
                toast.error(
                    typeof result.error === "string"
                        ? result.error
                        : "Failed to create order."
                );
                return;
            }

            toast.success("Order created successfully.");

            router.push(
                `/marketplace/checkout/${result.orderId}`
            );
        } catch (error) {
            console.error(error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Something went wrong."
            );
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (error || !system) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                Failed to load system.
            </div>
        );
    }

    const plans = [
        {
            id: "STARTER" as const,
            name: "Starter",
            tagline: "solo",
            monthlyPrice: system.starter_price,
        },
        {
            id: "PRO" as const,
            name: "Pro",
            tagline: "startup",
            monthlyPrice: system.pro_price,
        },
        {
            id: "BUSINESS" as const,
            name: "Business",
            tagline: "teams",
            monthlyPrice: system.business_price,
        },
    ];

    const activePlan = plans.find((p) => p.id === selectedPlan) || plans[1];
    const totalPrice = (activePlan.monthlyPrice * usersCount).toFixed(2);

    const getFeaturesList = (planKey: PlanType) => {
        const limits = PLAN_LIMITS[planKey];
        return [
            { text: `Up to ${limits.maxAdmins} Admin${limits.maxAdmins > 1 ? "s" : ""}`, included: true },
            { text: limits.hasReports ? "Advanced Reports" : "Basic Analytics", included: limits.hasReports },
            { text: limits.hasWordAssistant ? "Word Assistant Included" : "No Word Assistant", included: limits.hasWordAssistant },
            { text: limits.api ? "Full API Access" : "No API Access", included: limits.api },
        ];
    };

    return (
        <div className="w-full min-h-screen flex justify-center pt-10">
            <div className="w-full max-w-4xl max-h-auto mx-auto p-6 font-sans">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                    Select a Plan
                </h2>
                <div className="mb-8">
                    <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                        Choose License Type
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {licenseTypes.map((type) => {
                            const isSelected = selectedLicense === type;

                            return (
                                <button
                                    key={type}
                                    onClick={() => setSelectedLicense(type)}
                                    className={`rounded-xl border p-4 text-left transition-all ${isSelected
                                        ? "border-neutral-900 dark:border-white ring-1 ring-neutral-900 dark:ring-white"
                                        : "border-neutral-200 dark:border-neutral-800"
                                        }`}
                                >
                                    <div className="font-semibold">
                                        {LICENSE_MODELS[type].label}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Plans List / Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {plans.map((plan) => {
                        const isSelected = selectedPlan === plan.id;
                        const price = plan.monthlyPrice;
                        const features = getFeaturesList(plan.id);

                        return (
                            <div
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan.id)}
                                className={`relative cursor-pointer rounded-2xl p-5 transition-all duration-200 border flex flex-col justify-between ${isSelected
                                    ? "border-neutral-900 dark:border-white ring-1 ring-neutral-900 dark:ring-white bg-white dark:bg-neutral-900 shadow-md"
                                    : "border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/40 hover:border-neutral-300 dark:hover:border-neutral-700"
                                    }`}
                            >
                                <div>
                                    {/* Plan Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {/* Radio Circle */}
                                            <div
                                                className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected
                                                    ? "border-neutral-900 dark:border-white"
                                                    : "border-neutral-300 dark:border-neutral-700"
                                                    }`}
                                            >
                                                {isSelected && (
                                                    <div className="w-2.5 h-2.5 bg-neutral-900 dark:bg-white rounded-full" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-neutral-900 dark:text-white text-base">
                                                    {plan.name}
                                                </h3>
                                                <p className="text-xs text-neutral-400 font-normal capitalize">
                                                    {plan.tagline}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-base font-bold text-neutral-900 dark:text-white">
                                                ${price}
                                            </div>
                                            <div className="text-[11px] text-neutral-400">Month</div>
                                        </div>
                                    </div>

                                    {/* Dynamic Features List */}
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

                {/* Bottom Actions Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-neutral-200/60 dark:border-neutral-800">
                    <button
                        onClick={handleOrder}
                        disabled={isCreating}
                        className="w-full sm:w-auto px-8 py-3 bg-neutral-950 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm">
                        {isCreating ? "Creating Order..." : `Order ($${totalPrice})`}
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}