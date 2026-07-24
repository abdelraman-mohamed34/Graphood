export interface DeveloperSystemInfo  {
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