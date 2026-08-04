"use client";

import { use, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useOrder } from "@/features/billing/use-order";
import { useCompletePayment } from "@/features/billing/use-complete-payment";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

interface PageProps {
    params: Promise<{
        order_id: string;
    }>;
}

export default function Page({ params }: PageProps) {
    const t = useTranslations("checkout");
    const locale = useLocale();
    const router = useRouter();
    const { order_id } = use(params);
    const { order, isLoading, error } = useOrder(order_id);
    const { completePayment, isProcessing } = useCompletePayment();
    const isPaid = order?.status === "PAID";
    const tenantSlug = order?.tenant_slug;

    useEffect(() => {
        if (isPaid && tenantSlug) {
            router.replace(`/${tenantSlug}/dashboard`);
        }
    }, [isPaid, router, tenantSlug]);

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

    if (isPaid) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center" role="status">
                <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
                <div className="space-y-1">
                    <p className="font-semibold text-foreground">{t("alreadyPaidRedirecting")}</p>
                    {!tenantSlug && (
                        <p className="text-sm text-muted-foreground">{t("preparingDashboard")}</p>
                    )}
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

    const formatMoney = (value: number | string | null) => {
        const amount = Number(value) || 0;
        try {
            return new Intl.NumberFormat(locale, {
                style: "currency",
                currency: order.currency || "EGP",
                maximumFractionDigits: 2,
            }).format(amount);
        } catch {
            return `${new Intl.NumberFormat(locale).format(amount)} ${order.currency}`;
        }
    };

    const translateValue = (group: "plans" | "licenses" | "statuses", value: string | null) => {
        if (!value) return t("notApplicable");
        const key = `${group}.${value.toLowerCase()}`;
        return t.has(key) ? t(key) : value;
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
                        {translateValue("plans", order.plan)}
                    </p>
                    <p>
                        <strong>{t("license")}:</strong>{" "}
                        {translateValue("licenses", order.license_type)}
                    </p>
                    <p>
                        <strong>{t("status")}:</strong>{" "}
                        {translateValue("statuses", order.status)}
                    </p>
                    <p>
                        <strong>{t("currency")}:</strong>{" "}
                        {order.currency}
                    </p>
                    <p>
                        <strong>{t("amount")}:</strong>{" "}
                        {formatMoney(order.amount)}
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
                            {formatMoney(pricing.subtotal)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>{t("discount")}</span>
                        <span>
                            {formatMoney(pricing.discount)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>{t("tax")}</span>
                        <span>
                            {formatMoney(pricing.tax)}
                        </span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold">
                        <span>{t("total")}</span>
                        <span>
                            {formatMoney(pricing.total)}
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
