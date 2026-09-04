import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const handleI18nRouting = createMiddleware(routing);

const DEVELOPER_CORS_HEADERS = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Tenant-Slug",
} as const;

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
  "/auth/reset-password/callback",
];

const PLATFORM_HOSTS = new Set([
  "graphood.com",
  "www.graphood.com",
  "app.graphood.com",
  "localhost",
  "127.0.0.1",
]);

const TENANT_SLUG_PATTERN = /^[a-z0-9-]+$/;

function normalizeTenantSlug(value: string | null) {
  const slug = value?.trim().toLowerCase() ?? "";
  return slug && TENANT_SLUG_PATTERN.test(slug) ? slug : null;
}

function hostnameFromRequest(req: NextRequest) {
  return (req.headers.get("host") ?? "")
    .split(":")[0]
    .toLowerCase()
    .replace(/\.$/, "");
}

function matchesPublicRoute(pathname: string, route: string) {
  if (route === "/") return pathname === "/";
  return pathname === route || pathname.startsWith(`${route}/`);
}

function removeLeadingLocale(pathname: string) {
  const firstSegment = pathname.split("/")[1];
  if (routing.locales.includes(firstSegment as (typeof routing.locales)[number])) {
    return pathname.slice(firstSegment.length + 1) || "/";
  }
  return pathname;
}

function tenantSlugFromHost(req: NextRequest) {
  const host = hostnameFromRequest(req);

  // Platform hosts must never honor a client-supplied tenant header.
  if (!host || PLATFORM_HOSTS.has(host)) return null;

  // This header is a routing hint only. Tenant layouts still enforce auth,
  // membership, permissions, and database row-level security.
  const headerSlug = normalizeTenantSlug(req.headers.get("x-tenant-slug"));
  if (headerSlug) return headerSlug;

  if (host.endsWith(".localhost") || host.endsWith(".graphood.com")) {
    const suffix = host.endsWith(".localhost") ? ".localhost" : ".graphood.com";
    const slug = host.slice(0, -suffix.length);
    return slug && !slug.includes(".") ? normalizeTenantSlug(slug) : null;
  }

  return null;
}

function isAllowedLocalhostOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);

    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.port === "3000" &&
      (url.hostname === "localhost" || url.hostname.endsWith(".localhost"))
    );
  } catch {
    return false;
  }
}

function addDeveloperCorsHeaders(
  response: NextResponse,
  origin: string
): NextResponse {
  if (isAllowedLocalhostOrigin(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  for (const [name, value] of Object.entries(DEVELOPER_CORS_HEADERS)) {
    response.headers.set(name, value);
  }

  response.headers.append("Vary", "Origin");
  return response;
}

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const tenantSlug = tenantSlugFromHost(req);
  if (tenantSlug) {
    const rewriteUrl = req.nextUrl.clone();
    const tenantPath = removeLeadingLocale(pathname);
    rewriteUrl.pathname = `/tenants/${encodeURIComponent(tenantSlug)}${tenantPath === "/" ? "" : tenantPath}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  // The matcher includes dotted tenant asset paths; platform assets still pass
  // through untouched when no tenant routing hint was resolved.
  if (!tenantSlug && (pathname.startsWith("/_next/") || pathname.includes("."))) {
    return NextResponse.next();
  }

  if (pathname === "/api/webhooks/kashier") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/developer")) {
    const origin = req.headers.get("origin") ?? "";

    if (req.method === "OPTIONS") {
      return addDeveloperCorsHeaders(
        new NextResponse(null, { status: 204 }),
        origin
      );
    }

    return addDeveloperCorsHeaders(NextResponse.next(), origin);
  }

  // The matcher must include /api for tenant hosts, but platform APIs remain
  // owned by their route handlers and must not enter locale/auth routing.
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const locales = routing.locales;
  type Locale = (typeof locales)[number];

  const pathLocale = pathname.split("/")[1] as Locale;

  const isLocaleInPath = locales.includes(pathLocale);

  const cleanPath = isLocaleInPath ? removeLeadingLocale(pathname) : pathname;

  const locale = isLocaleInPath
    ? pathLocale
    : routing.defaultLocale;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-graphood-locale", locale);
  const response = handleI18nRouting(new NextRequest(req, { headers: requestHeaders }));

  if (cleanPath === "/home") {
    return createRedirect(new URL(`/${locale}`, req.url), response, 308);
  }

  const isPublic = PUBLIC_ROUTES.some((route) => matchesPublicRoute(cleanPath, route));

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
  originalResponse: NextResponse,
  status: 307 | 308 = 307,
) {
  const redirectResponse = NextResponse.redirect(url, status);

  for (const cookie of originalResponse.cookies.getAll()) {
    redirectResponse.cookies.set(cookie);
  }

  return redirectResponse;
}

export const config = {
  matcher: [
    "/",
    "/(ar|en)/:path*",
    "/api/developer/:path*",
    "/((?!_vercel).*)",
  ],
};
