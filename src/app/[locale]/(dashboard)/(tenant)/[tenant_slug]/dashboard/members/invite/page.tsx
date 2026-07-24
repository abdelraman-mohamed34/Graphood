import { SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "../../_components/site-header";
import DashboardContainer from "@/shared/_components/dashboard-container";

import InviteMemberForm from "./_components/invite-member-form";

type Props = {
    params: Promise<{
        locale: string;
        tenant_slug: string;
    }>;
};

export default async function InviteMemberPage({
    params,
}: Props) {
    const { locale, tenant_slug } = await params;

    return (
        <SidebarInset>
            <SiteHeader title="Invite Member" />

            <DashboardContainer>
                <InviteMemberForm
                    locale={locale}
                    tenantSlug={tenant_slug}
                />
            </DashboardContainer>
        </SidebarInset>
    );
}