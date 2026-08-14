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

import { useTenantUsage } from "@/shared/lib/hooks";
import { useTranslations } from "next-intl";

export function SectionCards() {
  const t = useTranslations("dashboard.quickview");
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

  const licenseLabel = t(`licenses.${licenseType.toLowerCase()}`);

  const hasAI = features.wordAssistant;

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>
            {t("plan.title")}
          </CardDescription>

          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {t.has(`plans.${plan.toLowerCase()}`) ? t(`plans.${plan.toLowerCase()}`) : plan}
          </CardTitle>

          <CardAction>
            <Badge
              variant="outline"
              className="gap-1 border-primary/20 bg-primary/5 text-primary"
            >
              {t("active")}
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            {t("plan.type", { type: licenseLabel })}
          </div>

          <div className="text-muted-foreground">
            {admins.unlimited
              ? t("plan.unlimitedTerms")
              : t("plan.standardTerms")}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>
            {t("administrators.title")}
          </CardDescription>

          <CardTitle className="flex items-baseline text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {admins.unlimited ? (
              <>
                {t("unlimited")}
              </>
            ) : (
              <>
                <span>{t("administrators.usage", { current: admins.current, limit: admins.limit! })}</span>
              </>
            )}
          </CardTitle>

          <CardAction>
            <Badge
              variant="outline"
              className="gap-1"
            >
              <Users className="size-3" />
              {t("administrators.seats")}
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            {t("administrators.accessControl")}

            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>

          <div className="text-muted-foreground">
            {admins.unlimited
              ? t("administrators.unlimitedSeats")
              : t("administrators.remaining", { count: admins.remaining ?? 0 })}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>
            {t("ai.title")}
          </CardDescription>

          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {hasAI
              ? t("enabled")
              : t("disabled")}
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
              {t("ai.tools")}
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            {hasAI ? (
              <>
                {t("ai.smartEditing")}

                <CheckCircle2 className="size-4 text-emerald-500" />
              </>
            ) : (
              <>
                {t("ai.upgradeRequired")}

                <ShieldAlert className="size-4 text-amber-500" />
              </>
            )}
          </div>

          <div className="text-muted-foreground">
            {t("ai.description")}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
