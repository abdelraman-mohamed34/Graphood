import DashboardContainer from "@/shared/_components/dashboard-container";
import { SiteHeader } from "../_components/site-header";
import { Button } from "@/components/ui/button";
import { GeneralSettings } from "./_components/general-settings";
import { SidebarInset } from "@/components/ui/sidebar";
import { Suspense } from "react";
import { Dir } from "@/shared/_components/dirs";

export default function TenantSettingsPage() {
    return (
        <>
            <SidebarInset>
                <SiteHeader
                    title="Settings"
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