import { SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "../../_components/site-header";
import DashboardContainer from "@/shared/_components/dashboard-container";

import InviteMemberForm from "./_components/invite-member-form";
import { getTranslations } from "next-intl/server";

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
    const t = await getTranslations({ locale, namespace: "dashboard.members" });

    return (
        <SidebarInset>
            <SiteHeader title={t("invite.title")} />

            <DashboardContainer>
                <InviteMemberForm
                    locale={locale}
                    tenantSlug={tenant_slug}
                />
            </DashboardContainer>
        </SidebarInset>
    );
}
