import { SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "../../_components/site-header";
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

            <main className="flex flex-1 flex-col p-5">
                <InviteMemberForm
                    locale={locale}
                    tenantSlug={tenant_slug}
                />
            </main>
        </SidebarInset>
    );
}