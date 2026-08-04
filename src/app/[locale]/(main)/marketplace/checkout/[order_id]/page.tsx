"use client";

import { use } from "react";
import { useOrder } from "@/features/billing/use-order";
import { useCompletePayment } from "@/features/billing/use-complete-payment";

interface PageProps {
    params: Promise<{
        order_id: string;
    }>;
}

export default function Page({ params }: PageProps) {
    const { order_id } = use(params);
    const { order, isLoading, error } = useOrder(order_id);
    const { completePayment, isProcessing } = useCompletePayment();

    if (isLoading) {
        return (
            <div className="p-6">
                Loading...
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="p-6">
                <h1 className="text-xl font-semibold">
                    Order not found.
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
                    Checkout
                </h1>
                <div className="rounded-lg border p-4">
                    <h2 className="text-lg font-semibold">
                        This order has already been paid.
                    </h2>
                </div>
            </div>
        );
    }

    const pricing = {
        subtotal: order.amount,
        discount: 0,
        tax: 0,
        total: order.amount,
    };

    const handleCompletePayment = async () => {
        await completePayment(order.id);
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6 p-6">
            <h1 className="text-3xl font-bold">
                Checkout
            </h1>

            <section className="rounded-lg border p-6">
                <h2 className="mb-4 text-xl font-semibold">
                    Checkout Summary
                </h2>
                <div className="space-y-2">
                    <p>
                        <strong>System:</strong>{" "}
                        {system?.name}
                    </p>
                    <p>
                        <strong>Plan:</strong>{" "}
                        {order.plan}
                    </p>
                    <p>
                        <strong>License:</strong>{" "}
                        {order.license_type}
                    </p>
                    <p>
                        <strong>Status:</strong>{" "}
                        {order.status}
                    </p>
                    <p>
                        <strong>Currency:</strong>{" "}
                        {order.currency}
                    </p>
                    <p>
                        <strong>Amount:</strong>{" "}
                        {order.amount}
                    </p>
                </div>
            </section>

            <section className="rounded-lg border p-6">
                <h2 className="mb-4 text-xl font-semibold">
                    Order Summary
                </h2>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>
                            {pricing.subtotal} {order.currency}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Discount</span>
                        <span>
                            {pricing.discount} {order.currency}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tax</span>
                        <span>
                            {pricing.tax} {order.currency}
                        </span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>
                            {pricing.total} {order.currency}
                        </span>
                    </div>
                </div>
            </section>

            <section className="rounded-lg border p-6">
                <h2 className="mb-4 text-xl font-semibold">
                    Payment Method
                </h2>
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        checked
                        readOnly
                    />
                    <span>
                        Developer Mock Payment
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
                    ? "Processing Payment..."
                    : "Complete Payment"}
            </button>
        </div>
    );
}