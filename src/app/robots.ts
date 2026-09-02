import type { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/lib/seo";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: ["/", "/ar", "/en", "/ar/about", "/en/about", "/ar/faq", "/en/faq", "/ar/contact", "/en/contact", "/ar/refund-policy", "/en/refund-policy", "/ar/marketplace", "/en/marketplace", "/ar/marketplace/systems/", "/en/marketplace/systems/"],
            disallow: [
                "/api/", "/*?*", "/preview/", "/search", "/ar/login", "/en/login", "/ar/register", "/en/register",
                "/ar/admin/", "/en/admin/", "/ar/developer/", "/en/developer/", "/*/dashboard/", "/*/settings/",
                "/*/workspaces", "/*/onboarding", "/*/marketplace/checkout/", "/*/invitations/", "/*/reset-password",
            ],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
