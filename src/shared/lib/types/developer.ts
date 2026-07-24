export interface DeveloperContext {
    systemId: string;
    tenantId: string;
    tenantSlug: string;

    subscription: {
        planName: string;
        status: string;
        licenseType: string;
        billingInterval: string;
    };

    capabilities: {
        api: boolean;
        reports: boolean;
        wordAssistant: boolean;
    };
}