import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { getTenantBySlug } from "@/shared/lib/supabase/services/tenants/get-tenant-by-slug.service";

export default async function TenantStorePage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const supabase = await createSupabaseServerClient();
  const store = await getTenantBySlug(supabase, slug);

  if (!store || store.status !== "ACTIVE") notFound();

  return (
    <main>
      <h1>{store.name}</h1>
      <p>{store.email}</p>
    </main>
  );
}
