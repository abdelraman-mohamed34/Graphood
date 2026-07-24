'use client'

import { SidebarInset } from '@/components/ui/sidebar'
import { SiteHeader } from '../_components/site-header'
import Invitations from './_components/Invitations'
import CustomTable from './_components/CustomTable'
import DashboardContainer from '@/shared/_components/DashboardContainer'

export default function Page() {

    return (
        <SidebarInset>
            <SiteHeader title="Members" />
            <DashboardContainer className='space-y-5'>
                <CustomTable />
                <Invitations />
            </DashboardContainer>
        </SidebarInset>
    )
}