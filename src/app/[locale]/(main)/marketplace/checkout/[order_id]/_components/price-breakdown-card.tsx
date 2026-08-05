import { useTranslations } from "next-intl";

interface PriceBreakdownCardProps {
    pricing: {
        subtotal: number | null;
        discount: number | null;
        tax: number;
        total: number | null;
    };
    formatMoney: (value: number | string | null) => string;
}

export function PriceBreakdownCard({ pricing, formatMoney }: PriceBreakdownCardProps) {
    const t = useTranslations("checkout");

    return (
        <section className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-semibold">{t("orderSummary")}</h2>
            <div className="space-y-2">
                <div className="flex justify-between"><span>{t("subtotal")}</span><span>{formatMoney(pricing.subtotal)}</span></div>
                <div className="flex justify-between"><span>{t("discount")}</span><span>{formatMoney(pricing.discount)}</span></div>
                <div className="flex justify-between"><span>{t("tax")}</span><span>{formatMoney(pricing.tax)}</span></div>
                <hr />
                <div className="flex justify-between font-semibold"><span>{t("total")}</span><span>{formatMoney(pricing.total)}</span></div>
            </div>
        </section>
    );
}