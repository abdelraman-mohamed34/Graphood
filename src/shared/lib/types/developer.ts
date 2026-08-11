export interface DeveloperContext {
    mode: "live" | "sandbox";
    systemId: string;
    tenantId: string;
    tenantSlug: string;

    subscription: {
        plan: string;
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
