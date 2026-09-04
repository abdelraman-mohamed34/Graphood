import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { getTenantBySlug } from "@/shared/lib/supabase/services/tenants/get-tenant-by-slug.service";

export default async function TenantStoreLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const supabase = await createSupabaseServerClient();
  const store = await getTenantBySlug(supabase, slug);

  if (!store || store.status !== "ACTIVE") notFound();

  return <>{children}</>;
}
