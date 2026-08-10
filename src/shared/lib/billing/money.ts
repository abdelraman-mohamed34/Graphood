const MONEY_SCALE = 100;

export function roundMoney(value: number): number {
    if (!Number.isFinite(value)) throw new Error("Invalid monetary amount.");
    return Math.round((value + Number.EPSILON) * MONEY_SCALE) / MONEY_SCALE;
}

export function calculateDiscount({ amount, discountPercentage }: {
    amount: number;
    discountPercentage: number;
}) {
    const originalAmount = roundMoney(Math.max(0, amount));
    if (!Number.isFinite(discountPercentage) || discountPercentage < 1 || discountPercentage > 100) {
        throw new Error("Discount percentage must be between 1 and 100.");
    }
    const rawDiscount = originalAmount * discountPercentage / 100;
    const discountAmount = roundMoney(Math.min(originalAmount, Math.max(0, rawDiscount)));

    return {
        originalAmount,
        discountAmount,
        finalAmount: roundMoney(Math.max(0, originalAmount - discountAmount)),
    };
}
