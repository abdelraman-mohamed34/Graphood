"use client";

import { use, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useOrder } from "@/features/billing/use-order";
import { useInitiatePayment } from "@/features/billing/use-initiate-payment";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { OrderSummaryCard } from "./_components/order-summary-card";
import { PriceBreakdownCard } from "./_components/price-breakdown-card";
import { finalizeKashierRedirectAction } from "@/shared/lib/actions/billing/finalize-kashier-redirect.action";
import { TermsAgreementModal } from "@/shared/_components/TermsAgreementModal";

interface PageProps {
    params: Promise<{
        order_id: string;
    }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function Page({ params, searchParams }: PageProps) {
    const t = useTranslations("checkout");
    const locale = useLocale();
    const router = useRouter();
    const { order_id } = use(params);
    const callbackParams = use(searchParams);
    const callbackHandled = useRef(false);
    const { order, isLoading, error } = useOrder(order_id);

    const { mutate: initiatePayment, isPending: isInitiating } = useInitiatePayment();
    const [termsOpen, setTermsOpen] = useState(false);

    const isPaid = order?.status === "PAID";
    const tenantSlug = order?.tenant_slug;

    useEffect(() => {
        if (callbackHandled.current) return;
        const paymentStatus = typeof callbackParams.paymentStatus === "string" ? callbackParams.paymentStatus : undefined;
        if (!paymentStatus) return;
        callbackHandled.current = true;
        void finalizeKashierRedirectAction({
            orderId: order_id,
            paymentStatus,
            merchantOrderId: typeof callbackParams.merchantOrderId === "string" ? callbackParams.merchantOrderId : undefined,
            signature: typeof callbackParams.signature === "string" ? callbackParams.signature : undefined,
        }).then(() => undefined).catch(() => undefined);
    }, [callbackParams, order_id]);

    useEffect(() => {
        const paymentStatus = typeof callbackParams.paymentStatus === "string"
            ? callbackParams.paymentStatus.toUpperCase()
            : "";
        if (paymentStatus !== "SUCCESS") return;

        const timeout = window.setTimeout(() => {
            window.location.href = `/${locale}/workspaces`;
        }, 5_000);

        return () => window.clearTimeout(timeout);
    }, [callbackParams.paymentStatus, locale]);

    useEffect(() => {
        if (isPaid && tenantSlug) {
            router.replace(`/${tenantSlug}/dashboard/quickview`);
        }
    }, [isPaid, router, tenantSlug]);

    if (isLoading) return <div className="p-6">{t("loading")}</div>;
    if (error || !order) return <div className="p-6"><h1 className="text-xl font-semibold">{t("notFound")}</h1></div>;

    const system = Array.isArray(order.systems) ? order.systems[0] : order.systems;

    if (isPaid) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center" role="status">
                <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
                <div className="space-y-1">
                    <p className="font-semibold text-foreground">{t("alreadyPaidRedirecting")}</p>
                    {!tenantSlug && <p className="text-sm text-muted-foreground">{t("preparingDashboard")}</p>}
                </div>
            </div>
        );
    }

    const pricing = {
        subtotal: order.original_amount,
        discount: order.discount_amount,
        discountPercentage: order.discount_percentage,
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
            return `${new Intl.NumberFormat(locale).format(amount)} ${order.currency || "EGP"}`;
        }
    };

    const translateValue = (group: "plans" | "licenses" | "statuses", value: string | null) => {
        if (!value) return t("notApplicable");
        const key = `${group}.${value.toLowerCase()}`;
        return t.has(key) ? t(key) : value;
    };

    const handleCompletePayment = () => {
        initiatePayment({
            orderId: order.id,
            locale: locale === "ar" ? "ar" : "en",
        });
    };

    return (
        <div className="min-h-screen px-4 py-8 sm:px-6">
            <div className="mx-auto max-w-4xl space-y-4">
                <h1 className="text-3xl font-bold text-maroon">{t("title")}</h1>

                <OrderSummaryCard
                    order={order}
                    system={system}
                    formatMoney={formatMoney}
                    translateValue={translateValue}
                />

                <PriceBreakdownCard
                    pricing={pricing}
                    formatMoney={formatMoney}
                />

                <button
                    type="button"
                    onClick={() => setTermsOpen(true)}
                    disabled={isInitiating}
                    className="w-full rounded-sm bg-maroon px-4 py-3 font-medium text-white transition-colors hover:bg-teal disabled:opacity-50"
                >
                    {isInitiating ? t("processing") : t("completePayment")}
                </button>
                <Link href="/refund-policy" className="block text-center text-xs text-muted-foreground underline-offset-4 hover:underline">{t("refundPolicyLink")}</Link>
                <TermsAgreementModal open={termsOpen} onOpenChange={setTermsOpen} onProceed={() => { setTermsOpen(false); handleCompletePayment(); }} />
            </div>
        </div>
    );
}
