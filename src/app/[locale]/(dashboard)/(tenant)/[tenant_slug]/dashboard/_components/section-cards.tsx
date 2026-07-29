"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

import { LICENSE_MODELS } from "@/shared/config/licensing";
import { useTenantUsage } from "@/shared/lib/hooks";

export function SectionCards() {
  const {
    plan,
    licenseType,
    admins,
    features,
    isLoading,
  } = useTenantUsage();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[180px] animate-pulse rounded-xl border border-border/50 bg-muted/20"
          />
        ))}
      </div>
    );
  }

  const licenseLabel =
    LICENSE_MODELS[licenseType].label;

  const hasAI = features.wordAssistant;

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-3 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>
            Workspace Plan
          </CardDescription>

          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {plan}
          </CardTitle>

          <CardAction>
            <Badge
              variant="outline"
              className="gap-1 border-primary/20 bg-primary/5 text-primary"
            >
              Active
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            Type: {licenseLabel}
          </div>

          <div className="text-muted-foreground">
            {admins.unlimited
              ? "Unlimited workspace license."
              : "Standard subscription terms."}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>
            Administrators
          </CardDescription>

          <CardTitle className="flex items-baseline text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {admins.unlimited ? (
              <>
                Unlimited
              </>
            ) : (
              <>
                {admins.current}

                <span className="ml-0.5 text-xl font-normal text-primary/50">
                  /{admins.limit}
                </span>

                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  Users
                </span>
              </>
            )}
          </CardTitle>

          <CardAction>
            <Badge
              variant="outline"
              className="gap-1"
            >
              <Users className="size-3" />
              Seats
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            Access Control Enabled

            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>

          <div className="text-muted-foreground">
            {admins.unlimited
              ? "Unlimited administrator seats."
              : `${admins.remaining} seat(s) remaining.`}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>
            AI Word Assistant
          </CardDescription>

          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {hasAI
              ? "Enabled"
              : "Disabled"}
          </CardTitle>

          <CardAction>
            <Badge
              variant="outline"
              className={`gap-1 ${hasAI
                ? "border-amber-500/20 bg-amber-500/5 text-amber-600"
                : ""
                }`}
            >
              <Sparkles className="size-3" />
              AI Tools
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            {hasAI ? (
              <>
                Smart Editing Active

                <CheckCircle2 className="size-4 text-emerald-500" />
              </>
            ) : (
              <>
                Upgrade Required

                <ShieldAlert className="size-4 text-amber-500" />
              </>
            )}
          </div>

          <div className="text-muted-foreground">
            AI-powered document writing and context enhancement.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}