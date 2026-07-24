import { ReactNode } from "react";
import { redirect } from "next/navigation";
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { getMembershipBySlug } from "@/shared/lib/supabase/services/memberships/get-membership.service";
import { getSubscriptionByTenantID } from "@/shared/lib/supabase/services/subscriptions";

type QuickViewLayoutProps = {
  children: ReactNode;
  params: Promise<{
    locale: string;
    tenant_slug: string;
  }>;
};

export default async function QuickViewLayout({
  children,
  params,
}: QuickViewLayoutProps) {
  const { locale, tenant_slug } = await params;

  const supabase = await createSupabaseServerClient();
  const queryClient = new QueryClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Membership is needed only to resolve the tenant id
  const membership = await getMembershipBySlug({
    supabase,
    userId: user.id,
    tenantSlug: tenant_slug,
  });

  if (!membership) {
    redirect(`/${locale}/workspaces?error=unauthorized`);
  }

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