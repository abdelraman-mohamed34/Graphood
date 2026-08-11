import DashboardContainer from "@/shared/_components/dashboard-container";
import { SiteHeader } from "../_components/site-header";
import { GeneralSettings } from "./_components/general-settings";
import { SidebarInset } from "@/components/ui/sidebar";
import { Dir } from "@/shared/_components/dir";
import { getTranslations } from "next-intl/server";

export default async function TenantSettingsPage() {
    const t = await getTranslations("dashboard.settings");
    return (
        <>
            <SidebarInset>
                <SiteHeader
                    title={t("title")}
                />
                <Dir />

                <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
                    <DashboardContainer>
                        <GeneralSettings />
                    </DashboardContainer>
                </div>
            </SidebarInset>
        </>
    );
}
