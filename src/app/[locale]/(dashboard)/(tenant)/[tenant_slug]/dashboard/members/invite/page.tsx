import { SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "../../_components/site-header";
import DashboardContainer from "@/shared/_components/dashboard-container";

import InviteMemberForm from "./_components/invite-member-form";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
                <div className="mx-auto w-full max-w-2xl">
                    <Link
                        href={`/${tenant_slug}/dashboard/members`}
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {locale === "ar" ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}
                        {locale === "ar" ? "العودة إلى الأعضاء" : "Back to members"}
                    </Link>

                    <InviteMemberForm
                        locale={locale}
                        tenantSlug={tenant_slug}
                    />
                </div>
            </DashboardContainer>

        </SidebarInset>
    );
}