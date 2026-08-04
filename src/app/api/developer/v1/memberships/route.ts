import { withDeveloperContext } from "@/shared/lib/api/developer/with-developer-context";
import { developerJson } from "@/shared/lib/api/developer/response";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { getMembershipsByTenantId } from "@/shared/lib/supabase/services/memberships";


export const GET = withDeveloperContext(
    async (context) => {
        const supabase =
            await createAdminClient();

        const memberships =
            await getMembershipsByTenantId(
                context.tenantId,
                supabase
            );

        return developerJson({
            memberships: memberships.map(
                (membership) => {
                    const profile =
                        Array.isArray(membership.profile)
                            ? membership.profile[0]
                            : membership.profile;

                    return {
                        id: membership.id,

                        role: membership.role,

                        permissions:
                            membership.permissions,

                        status:
                            membership.status,

                        user: profile
                            ? {
                                id: profile.id,
                                firstName:
                                    profile.first_name,
                                lastName:
                                    profile.last_name,
                                email:
                                    profile.email,
                                avatarUrl:
                                    profile.avatar_url,
                            }
                            : null,

                        joinedAt:
                            membership.joined_at,

                        createdAt:
                            membership.created_at,
                    };
                }
            ),
        });
    }
);