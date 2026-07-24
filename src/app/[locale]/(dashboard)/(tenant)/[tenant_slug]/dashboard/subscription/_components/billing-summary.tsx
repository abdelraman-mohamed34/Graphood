"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


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

  const items = [
    {
      label: "Current Price",
      value: price,
    },
    {
      label: "Currency",
      value: currency,
    },
    {
      label: "Billing Cycle",
      value: billingCycle,
    },
    {
      label: "Next Payment",
      value: nextPayment,
    },
  ]


  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Billing Summary
        </CardTitle>

        <CardDescription>
          Overview of your current billing information.
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