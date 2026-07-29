import { ReactNode, cache } from "react";
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";

import { getSubscriptionByTenantID } from "@/shared/lib/supabase/services/subscriptions";
import { requireMembership } from "@/shared/lib/auth/requires/require-membership";
import { requireUser } from "@/shared/lib/auth/requires/require-user";

type QuickViewLayoutProps = {
  children: ReactNode;
  params: Promise<{
    locale: string;
    tenant_slug: string;
  }>;
};

const getCachedMembership = cache(requireMembership);

export default async function QuickViewLayout({
  children,
  params,
}: QuickViewLayoutProps) {
  const { locale, tenant_slug } = await params;

  const queryClient = new QueryClient();

  const { user, supabase } = await requireUser(locale);

  const membership = await getCachedMembership({
    tenantSlug: tenant_slug,
    userId: user.id,
    supabase,
    redirectTo: `/${locale}/workspaces?error=unauthorized`,
  });

  await queryClient.prefetchQuery({
    queryKey: ["subscriptions", membership.tenant_id],
    queryFn: () =>
      getSubscriptionByTenantID(
        supabase,
        membership.tenant_id
      ),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}