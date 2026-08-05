import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const handleI18nRouting = createMiddleware(routing);

export async function proxy(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    let response = handleI18nRouting(req);

    const locales = routing.locales;
    type Locale = (typeof locales)[number];
    const pathLocale = pathname.split("/")[1];
    const isLocaleInPath = locales.includes(pathLocale as Locale);

    const cleanPath = pathname.replace(new RegExp(`^/(${locales.join("|")})`), "") || "/";

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll();
                },

                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        req.cookies.set(name, value)
                    );

                    response = NextResponse.next({
                        request: req,
                    });

                    cookiesToSet.forEach(
                        ({ name, value, options }) =>
                            response.cookies.set(
                                name,
                                value,
                                options
                            )
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    let effectiveLocale = isLocaleInPath ? pathLocale : routing.defaultLocale;

    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("preferred_language")
            .eq("id", user.id)
            .single();

        if (profile?.preferred_language && locales.includes(profile.preferred_language as Locale)) {
            effectiveLocale = profile.preferred_language as Locale;

            if (!isLocaleInPath || pathLocale !== effectiveLocale) {
                const redirectPath = cleanPath === "/" ? "/home" : cleanPath;
                return NextResponse.redirect(
                    new URL(`/${effectiveLocale}${redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`}`, req.url)
                );
            }
        }
    }

    const locale = effectiveLocale;

    if (cleanPath === "/") {
        return NextResponse.redirect(
            new URL(`/${locale}/home`, req.url)
        );
    }

    const isAuth =
        cleanPath.startsWith("/login") ||
        cleanPath.startsWith("/register");

    const isPublic =
        cleanPath.startsWith("/home") ||
        isAuth ||
        cleanPath.startsWith("/workspaces") ||
        cleanPath.startsWith("/invitations/accept") ||
        cleanPath.startsWith("/select-workspace") ||
        cleanPath.startsWith("/marketplace");

    if (!isPublic && !user) {
        return NextResponse.redirect(
            new URL(`/${locale}/login`, req.url)
        );
    }

    if (isAuth && user) {
        return NextResponse.redirect(
            new URL(`/${locale}/workspaces`, req.url)
        );
    }

    const systemMatch = cleanPath.match(/^\/marketplace\/systems\/([^\/]+)$/);

    if (systemMatch && user) {
        const systemId = systemMatch[1];

        const { data: system } = await supabase
            .from("systems")
            .select("owner_id")
            .eq("id", systemId)
            .single();

        if (system && user.id === system.owner_id) {
            return NextResponse.redirect(
                new URL(`/${locale}/developer/systems/${systemId}`, req.url)
            );
        }
    }

    return response;
}

export const config = {
    matcher: [
        "/",
        "/(ar|en)/:path*",
        "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
    ],
};
