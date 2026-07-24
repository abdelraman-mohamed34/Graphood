"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Users, Sparkles, CheckCircle2, ShieldAlert } from "lucide-react"
import { useSubscription } from "@/shared/lib/hooks"
import { useMemberships } from "@/shared/lib/hooks"

type SectionCardsProps = {
  tenantId: string
}

export function SectionCards({ tenantId }: SectionCardsProps) {
  const { capabilities, isLoading: subLoading } = useSubscription(tenantId)
  const { memberships, isLoading: membershipLoading } = useMemberships()
  const isLoading = subLoading || membershipLoading

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[180px] animate-pulse rounded-xl border border-border/50 bg-muted/20" />
        ))}
      </div>
    )
  }

  const maxAdmins = capabilities?.limits?.maxAdmins ?? 0
  const isExclusive = capabilities?.license?.isExclusive ?? false
  const planName = capabilities?.planName ?? "No Active"
  const licenseLabel = capabilities?.license?.label ?? "No License"
  const hasAI = capabilities?.limits?.hasWordAssistant ?? false

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-3 dark:*:data-[slot=card]:bg-card">

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Workspace Plan</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {planName}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 border-primary/20 bg-primary/5 text-primary">
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium items-center">
            Type: {licenseLabel}
          </div>
          <div className="text-muted-foreground">
            {isExclusive ? "Permanent life-time access" : "Standard subscription terms"}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Administrators Limit</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-baseline">
            {memberships?.length ?? 0}
            <span className="text-primary/50 text-xl ml-0.5 font-normal">
              /{maxAdmins}
            </span>
            <span className="text-sm font-normal text-muted-foreground ml-1">
              Users
            </span>
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <Users className="size-3" />
              Seats
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium items-center">
            Access Control Enabled <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <div className="text-muted-foreground">
            Maximum seat capacity allowed for team scale
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>AI Word Assistant</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {hasAI ? "Enabled" : "Disabled"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className={`gap-1 ${hasAI ? 'border-amber-500/20 bg-amber-500/5 text-amber-600' : ''}`}>
              <Sparkles className="size-3" />
              AI Tools
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium items-center">
            {hasAI ? (
              <>Smart Editing Active <CheckCircle2 className="size-4 text-emerald-500" /></>
            ) : (
              <>Upgrade Required <ShieldAlert className="size-4 text-amber-500" /></>
            )}
          </div>
          <div className="text-muted-foreground">
            AI-powered document writing and context enhancement
          </div>
        </CardFooter>
      </Card>

    </div>
  )
}