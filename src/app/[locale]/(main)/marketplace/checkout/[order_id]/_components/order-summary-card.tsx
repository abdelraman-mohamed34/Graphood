import { useTranslations } from "next-intl";
import type { CheckOrderStatusData } from "@/shared/lib/actions/billing/check-order-status.action";

type OrderSummarySystem = CheckOrderStatusData["systems"] extends Array<infer Item>
    ? Item
    : CheckOrderStatusData["systems"];

interface OrderSummaryCardProps {
    order: CheckOrderStatusData;
    system: OrderSummarySystem | null | undefined;
    formatMoney: (value: number | string | null) => string;
    translateValue: (group: "plans" | "licenses" | "statuses", value: string | null) => string;
}

export function OrderSummaryCard({ order, system, formatMoney, translateValue }: OrderSummaryCardProps) {
    const t = useTranslations("checkout");

    return (
        <section className="rounded border-2 p-6">
            <h2 className="mb-4 text-xl font-semibold">{t("checkoutSummary")}</h2>
            <div className="space-y-2">
                <p><strong>{t("system")}:</strong> {system?.name}</p>
                <p><strong>{t("plan")}:</strong> {translateValue("plans", order.plan)}</p>
                <p><strong>{t("license")}:</strong> {translateValue("licenses", order.license_type)}</p>
                <p><strong>{t("status")}:</strong> {translateValue("statuses", order.status)}</p>
                <p><strong>{t("currency")}:</strong> {order.currency}</p>
                <p><strong>{t("amount")}:</strong> {formatMoney(order.amount)}</p>
            </div>
        </section>
    );
}
