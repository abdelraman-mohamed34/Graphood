"use client";

import { Wallet, Zap, Check } from "lucide-react";
import { useTranslations } from "next-intl";

interface PaymentMethodSelectorProps {
    selectedMethod: "wallet" | "instapay";
    onSelectMethod: (method: "wallet" | "instapay") => void;
    disabled?: boolean;
}

export function PaymentMethodSelector({
    selectedMethod,
    onSelectMethod,
    disabled = false,
}: PaymentMethodSelectorProps) {
    const t = useTranslations("checkout");

    return (
        <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
                {t("paymentMethod")}
            </h2>

            <div
                className="flex flex-col gap-3"
                role="radiogroup"
                aria-label={t("paymentMethod")}
            >
                {/* خيار المحافظ الإلكترونية */}
                <div
                    role="radio"
                    aria-checked={selectedMethod === "wallet"}
                    aria-disabled={disabled}
                    tabIndex={disabled ? -1 : 0}
                    onClick={() => !disabled && onSelectMethod("wallet")}
                    onKeyDown={(e) => {
                        if ((e.key === "Enter" || e.key === " ") && !disabled) {
                            e.preventDefault();
                            onSelectMethod("wallet");
                        }
                    }}
                    className={`group relative flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all duration-200 ${disabled ? "opacity-50 cursor-not-allowed" : ""
                        } ${selectedMethod === "wallet"
                            ? "border-primary bg-primary/[0.03] ring-2 ring-primary shadow-sm"
                            : "border-border/60 hover:border-border hover:bg-muted/50"
                        }`}
                >
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-muted text-teal">
                            <Wallet className="h-6 w-6 stroke-[2.2]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">
                                    {t.has("walletsTitle") ? t("walletsTitle") : "المحافظ الإلكترونية"}
                                </span>
                                <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-medium text-teal">
                                    {t.has("walletsBadge") ? t("walletsBadge") : "فودافون كاش وغيرها"}
                                </span>
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Vodafone Cash, Orange, Etisalat, WE
                            </p>
                        </div>
                    </div>

                    <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${selectedMethod === "wallet"
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30"
                            }`}
                    >
                        {selectedMethod === "wallet" && (
                            <Check className="h-3 w-3 stroke-[3]" />
                        )}
                    </div>
                </div>

                {/* خيار إنستاباي (InstaPay) */}
                <div
                    role="radio"
                    aria-checked={selectedMethod === "instapay"}
                    aria-disabled={disabled}
                    tabIndex={disabled ? -1 : 0}
                    onClick={() => !disabled && onSelectMethod("instapay")}
                    onKeyDown={(e) => {
                        if ((e.key === "Enter" || e.key === " ") && !disabled) {
                            e.preventDefault();
                            onSelectMethod("instapay");
                        }
                    }}
                    className={`group relative flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all duration-200 ${disabled ? "opacity-50 cursor-not-allowed" : ""
                        } ${selectedMethod === "instapay"
                            ? "border-primary bg-primary/[0.03] ring-2 ring-primary shadow-sm"
                            : "border-border/60 hover:border-border hover:bg-muted/50"
                        }`}
                >
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
                            <Zap className="h-6 w-6 fill-purple-600/20 stroke-[2.2]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">InstaPay</span>
                                <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-medium text-purple-600">
                                    {t.has("instapayBadge") ? t("instapayBadge") : "تحويل لحظي"}
                                </span>
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Instant bank transfer via InstaPay network
                            </p>
                        </div>
                    </div>

                    <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${selectedMethod === "instapay"
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30"
                            }`}
                    >
                        {selectedMethod === "instapay" && (
                            <Check className="h-3 w-3 stroke-[3]" />
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
