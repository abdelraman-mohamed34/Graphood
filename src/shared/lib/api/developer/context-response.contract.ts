export interface DeveloperContextResponse {
    system: {
        id: string;
        name: string;
        slug: string;
    };

    tenant: {
        id: string;
        slug: string;
    };

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