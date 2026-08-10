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
                hostname: "plus.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "avatar.vercel.sh",
            },
            {
                protocol: "https",
                hostname: "fvmfqtplyzfxuhiqgklm.supabase.co",
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: '*.googleusercontent.com',
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