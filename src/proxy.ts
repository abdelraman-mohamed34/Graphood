import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const handleI18nRouting = createMiddleware(routing);

const PUBLIC_ROUTES = [
  "/",
  "/home",
  "/login",
  "/register",
  "/marketplace",
  "/workspaces",
  "/select-workspace",
  "/invitations/accept",
  "/auth/callback",
];

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  let response = handleI18nRouting(req);

  const locales = routing.locales;
  type Locale = (typeof locales)[number];

  const pathLocale = pathname.split("/")[1] as Locale;

  const isLocaleInPath = locales.includes(pathLocale);

  const cleanPath =
    pathname.replace(new RegExp(`^/(${locales.join("|")})`), "") || "/";

  const locale = isLocaleInPath
    ? pathLocale
    : routing.defaultLocale;

  if (cleanPath === "/") {
    return createRedirect(
      new URL(`/${locale}/home`, req.url),
      response
    );
  }

  const isPublic = PUBLIC_ROUTES.some((route) =>
    cleanPath.startsWith(route)
  );

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

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;

  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    user = authUser;
  } catch {
    user = null;
  }

  if (!isPublic && !user) {
    return createRedirect(
      new URL(`/${locale}/login`, req.url),
      response
    );
  }

  if (
    user &&
    (cleanPath.startsWith("/login") ||
      cleanPath.startsWith("/register"))
  ) {
    return createRedirect(
      new URL(`/${locale}/workspaces`, req.url),
      response
    );
  }

  if (user) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("preferred_language")
        .eq("id", user.id)
        .single();

      if (
        profile?.preferred_language &&
        locales.includes(profile.preferred_language as Locale) &&
        profile.preferred_language !== locale
      ) {
        return createRedirect(
          new URL(
            `/${profile.preferred_language}${cleanPath}`,
            req.url
          ),
          response
        );
      }
    } catch {
      // ignore profile errors
    }
  }

  const systemMatch =
    cleanPath.match(/^\/marketplace\/systems\/([^/]+)$/);

  if (systemMatch && user) {
    try {
      const systemId = systemMatch[1];

      const { data: system } = await supabase
        .from("systems")
        .select("owner_id")
        .eq("id", systemId)
        .single();

      if (system?.owner_id === user.id) {
        return createRedirect(
          new URL(
            `/${locale}/developer/systems/${systemId}`,
            req.url
          ),
          response
        );
      }
    } catch {
      // ignore
    }
  }

  return response;
}

function createRedirect(
  url: URL,
  originalResponse: NextResponse
) {
  const redirectResponse = NextResponse.redirect(url);

  for (const cookie of originalResponse.cookies.getAll()) {
    redirectResponse.cookies.set(cookie);
  }

  return redirectResponse;
}

export const config = {
  matcher: [
    "/",
    "/(ar|en)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};