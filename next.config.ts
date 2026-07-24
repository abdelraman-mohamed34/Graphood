import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "avatar.vercel.sh",
            },
            {
                protocol: "https",
                hostname: "fvmfqtplyzfxuhiqgklm.supabase.co",
            },
        ],
    },

    async redirects() {
        return [
            {
                source: "/:locale/:tenant_slug/dashboard",
                destination: "/:locale/:tenant_slug/dashboard/quickview",
                permanent: false,
            },
        ];
    },
};

export default withNextIntl(nextConfig);