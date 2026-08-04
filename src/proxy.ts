import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const handleI18nRouting = createMiddleware(routing);

export async function proxy(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    const locale = pathname.split("/")[1] || routing.defaultLocale;

    const cleanPath = pathname.replace(`/${locale}`, "");

    if (cleanPath === "" || cleanPath === "/") {
        return NextResponse.redirect(
            new URL(`/${locale}/home`, req.url)
        );
    }

    let response = handleI18nRouting(req);

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

    const isAuth =
        cleanPath.startsWith("/login") ||
        cleanPath.startsWith("/register");

    const isPublic =
        cleanPath.startsWith("/home") ||
        isAuth ||
        cleanPath.startsWith("/workspaces") ||
        cleanPath.startsWith("/invitations/accept") ||
        cleanPath.startsWith("/select-workspace");

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

    return response;
}

export const config = {
    matcher: [
        "/",
        "/(ar|en)/:path*",
        "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
    ],
};