"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTranslations } from "next-intl"


type BillingSummaryProps = {
  price?: string
  currency?: string
  billingCycle?: string
  nextPayment?: string
}


export default function BillingSummary({
  price = "-",
  currency = "-",
  billingCycle = "-",
  nextPayment = "-",
}: BillingSummaryProps) {
  const t = useTranslations("dashboard.subscription")

  const items = [
    {
      label: t("billing.currentPrice"),
      value: price,
    },
    {
      label: t("billing.currency"),
      value: currency,
    },
    {
      label: t("billing.billingCycle"),
      value: billingCycle,
    },
    {
      label: t("billing.nextPayment"),
      value: nextPayment,
    },
  ]


  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t("billing.title")}
        </CardTitle>

        <CardDescription>
          {t("billing.description")}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border p-4"
            >
              <p className="text-sm text-muted-foreground">
                {item.label}
              </p>

              <p className="mt-2 text-xl font-semibold">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
