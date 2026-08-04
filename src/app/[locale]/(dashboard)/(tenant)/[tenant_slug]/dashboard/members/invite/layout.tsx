import { requireMembership } from "@/shared/lib/auth/requires/require-membership";
import { hasAnyPermission } from "@/shared/lib/auth/requires/require-permission";
import { requireUser } from "@/shared/lib/auth/requires/require-user";
import { redirect } from "next/navigation";

type AddTenantMemberType = {
    children: React.ReactNode;
    params: Promise<{
        locale: string;
        tenant_slug: string;
    }>;
};

export default async function AddTenantMemberLayout({
    params,
    children,
}: AddTenantMemberType) {
    const { locale, tenant_slug } = await params;

    const { user, supabase } = await requireUser(locale);

    const membership = await requireMembership({
        tenantSlug: tenant_slug,
        userId: user.id,
        supabase,
        redirectTo: `/${locale}/workspaces?error=unauthorized`,
    });
    if (
        !hasAnyPermission(membership, ["members.invite", "tenant.manage"])
    ) {
        redirect(`/${locale}/workspaces?error=unauthorized`);
    }

    return children;
}
