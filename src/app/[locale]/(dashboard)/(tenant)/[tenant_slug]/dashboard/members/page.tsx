'use client'

import { SidebarInset } from '@/components/ui/sidebar'
import { SiteHeader } from '../_components/site-header'
import DashboardContainer from '@/shared/_components/dashboard-container'

import { InvitationsTable } from './_components/invitations'
import MembersTable from './_components/table/members-table'

export default function Page() {
    return (
        <SidebarInset>
            <SiteHeader title="Members" />

            <DashboardContainer className="space-y-5">
                <MembersTable />

                <InvitationsTable />
            </DashboardContainer>
        </SidebarInset>
    )
}