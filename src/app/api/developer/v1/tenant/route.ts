import { withDeveloperContext } from "@/shared/lib/api/developer/with-developer-context";
import { developerJson, developerJsonError } from "@/shared/lib/api/developer/response";
import { DeveloperApiErrorCodes } from "@/shared/lib/api/developer/errors";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { getTenantById } from "@/shared/lib/supabase/services/tenants/get-tenant-by-id.service";
import { MOCK_TENANT } from "@/shared/lib/api/developer/sandbox";


export const GET = withDeveloperContext(
    async (context) => {
        if (context.mode === "sandbox") {
            return developerJson({ tenant: MOCK_TENANT });
        }

        const supabase = await createAdminClient();

        const tenant = await getTenantById(
            context.tenantId,
            supabase
        );

        if (!tenant) {
            return developerJsonError(
                DeveloperApiErrorCodes.TENANT_NOT_FOUND,
                "Tenant not found",
                404
            );
        }

        return developerJson({
            tenant: {
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
                status: tenant.status,

                email: tenant.email,
                phone: tenant.phone,

                country: tenant.country,
                city: tenant.city,

                timezone: tenant.timezone,

                branding: {
                    logoUrl: tenant.logo_url,
                    primaryColor: tenant.primary_color,
                },
            },
        });
    }
);
