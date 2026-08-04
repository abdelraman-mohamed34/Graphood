"use client";

import { use } from "react";
import { useOrder } from "@/features/billing/use-order";
import { useCompletePayment } from "@/features/billing/use-complete-payment";
import { useTranslations } from "next-intl";

interface PageProps {
    params: Promise<{
        order_id: string;
    }>;
}

export default function Page({ params }: PageProps) {
    const t = useTranslations("checkout");
    const { order_id } = use(params);
    const { order, isLoading, error } = useOrder(order_id);
    const { completePayment, isProcessing } = useCompletePayment();

    if (isLoading) {
        return (
            <div className="p-6">
                {t("loading")}
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="p-6">
                <h1 className="text-xl font-semibold">
                    {t("notFound")}
                </h1>
            </div>
        );
    }

    const system = Array.isArray(order.systems)
        ? order.systems[0]
        : order.systems;

    if (order.status === "PAID") {
        return (
            <div className="p-6 space-y-6">
                <h1 className="text-2xl font-bold">
                    {t("title")}
                </h1>
                <div className="rounded-lg border p-4">
                    <h2 className="text-lg font-semibold">
                        {t("alreadyPaid")}
                    </h2>
                </div>
            </div>
        );
    }

    const pricing = {
        subtotal: order.original_amount,
        discount: order.discount_amount,
        tax: 0,
        total: order.amount,
    };

    const handleCompletePayment = async () => {
        await completePayment(order.id);
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6 p-6">
            <h1 className="text-3xl font-bold">
                {t("title")}
            </h1>

            <section className="rounded-lg border p-6">
                <h2 className="mb-4 text-xl font-semibold">
                    {t("checkoutSummary")}
                </h2>
                <div className="space-y-2">
                    <p>
                        <strong>{t("system")}:</strong>{" "}
                        {system?.name}
                    </p>
                    <p>
                        <strong>{t("plan")}:</strong>{" "}
                        {order.plan}
                    </p>
                    <p>
                        <strong>{t("license")}:</strong>{" "}
                        {order.license_type}
                    </p>
                    <p>
                        <strong>{t("status")}:</strong>{" "}
                        {order.status}
                    </p>
                    <p>
                        <strong>{t("currency")}:</strong>{" "}
                        {order.currency}
                    </p>
                    <p>
                        <strong>{t("amount")}:</strong>{" "}
                        {order.amount}
                    </p>
                </div>
            </section>

            <section className="rounded-lg border p-6">
                <h2 className="mb-4 text-xl font-semibold">
                    {t("orderSummary")}
                </h2>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>{t("subtotal")}</span>
                        <span>
                            {pricing.subtotal} {order.currency}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>{t("discount")}</span>
                        <span>
                            {pricing.discount} {order.currency}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>{t("tax")}</span>
                        <span>
                            {pricing.tax} {order.currency}
                        </span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold">
                        <span>{t("total")}</span>
                        <span>
                            {pricing.total} {order.currency}
                        </span>
                    </div>
                </div>
            </section>

            <section className="rounded-lg border p-6">
                <h2 className="mb-4 text-xl font-semibold">
                    {t("paymentMethod")}
                </h2>
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        checked
                        readOnly
                    />
                    <span>
                        {t("mockPayment")}
                    </span>
                </label>
            </section>

            <button
                type="button"
                onClick={handleCompletePayment}
                disabled={isProcessing}
                className="w-full rounded-lg bg-black px-4 py-3 text-white disabled:opacity-50"
            >
                {isProcessing
                    ? t("processing")
                    : t("completePayment")}
            </button>
        </div>
    );
}
