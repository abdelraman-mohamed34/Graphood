const MONEY_SCALE = 100;

export function roundMoney(value: number): number {
    if (!Number.isFinite(value)) throw new Error("Invalid monetary amount.");
    return Math.round((value + Number.EPSILON) * MONEY_SCALE) / MONEY_SCALE;
}

export function calculateDiscount({ amount, discountType, discountValue, maxDiscount }: {
    amount: number;
    discountType: "PERCENT" | "FIXED";
    discountValue: number;
    maxDiscount?: number | null;
}) {
    const originalAmount = roundMoney(Math.max(0, amount));
    const rawDiscount = discountType === "PERCENT"
        ? originalAmount * discountValue / 100
        : discountValue;
    const cappedDiscount = discountType === "PERCENT" && maxDiscount != null
        ? Math.min(rawDiscount, maxDiscount)
        : rawDiscount;
    const discountAmount = roundMoney(Math.min(originalAmount, Math.max(0, cappedDiscount)));

    return {
        originalAmount,
        discountAmount,
        finalAmount: roundMoney(Math.max(0, originalAmount - discountAmount)),
    };
}
