type InsertMembershipData = {
    profileId: string,
    tenantId: string,
    role: string,
    invited_by: string
}

export async function insertMembership(supabase: any, data: InsertMembershipData) {
    const { profileId, tenantId, role, invited_by } = data

    const { error } = await supabase
        .from('memberships')
        .insert({
            profile_id: profileId,
            tenant_id: tenantId,
            current_tenant_id: tenantId,
            role: role,
            invited_by: invited_by,
            status: "ACTIVE",
            joined_at: new Date().toISOString()
        })

    return { error }
}