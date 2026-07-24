export const DeveloperAuthContract = {

    header: "Authorization",

    scheme: "Bearer",

    keyPrefix: "gh_sk_",

    tenantIdentifier: "tenantSlug",

} as const;



export const DeveloperTenantContract = {

    identifier: "tenantSlug",

    allowTenantId: false,

} as const;