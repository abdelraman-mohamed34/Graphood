import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { getTenantProxyTargetBySlug } from "@/shared/lib/supabase/services/tenants/get-tenant-proxy-target-by-slug.service";

const SAFE_REQUEST_HEADERS = ["accept", "accept-encoding", "accept-language", "cache-control", "content-type", "user-agent"];
const BODY_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function validateTargetUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !url.hostname.endsWith(".vercel.app") || url.hostname === "vercel.app") return null;
    url.search = "";
    return url;
  } catch {
    return null;
  }
}

function upstreamHeaders(request: Request) {
  const headers = new Headers();
  for (const name of SAFE_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
}

function rewriteLocation(value: string | null, target: URL, request: Request) {
  if (!value) return null;
  try {
    const location = new URL(value, target);
    if (location.origin !== target.origin) return value;
    const incoming = new URL(request.url);
    return `${incoming.origin}${location.pathname}${location.search}${location.hash}`;
  } catch {
    return value;
  }
}

async function proxyTenantRequest(request: Request, context: { params: Promise<{ tenant: string; path?: string[] }> }) {
  const { tenant, path = [] } = await context.params;
  const supabase = await createSupabaseServerClient();
  const record = await getTenantProxyTargetBySlug(supabase, tenant);
  if (!record || record.status !== "ACTIVE") return new NextResponse("Not found", { status: 404 });

  const target = validateTargetUrl(record.targetUrl);
  if (!target) {
    console.error("Tenant proxy target rejected", { tenant, reason: "missing-or-unapproved-target" });
    return new NextResponse("Tenant website is not configured", { status: 502 });
  }

  target.pathname = `/${path.map((segment) => encodeURIComponent(segment)).join("/")}`;
  const incoming = new URL(request.url);
  target.search = incoming.search;
  const body = BODY_METHODS.has(request.method) ? await request.arrayBuffer() : undefined;
  let upstream: Response;
  try {
    upstream = await fetch(target, { method: request.method, headers: upstreamHeaders(request), body, redirect: "manual", cache: "no-store" });
  } catch (error) {
    console.error("Tenant upstream request failed", { tenant, target: target.origin, error });
    return new NextResponse("Tenant website unavailable", { status: 502 });
  }
  const responseHeaders = new Headers();
  for (const name of ["cache-control", "content-type", "etag", "last-modified", "vary"]) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  const location = rewriteLocation(upstream.headers.get("location"), new URL(record.targetUrl!), request);
  if (location) responseHeaders.set("location", location);
  return new NextResponse(request.method === "HEAD" ? null : upstream.body, { status: upstream.status, headers: responseHeaders });
}

export async function GET(request: Request, context: { params: Promise<{ tenant: string; path?: string[] }> }) {
  return proxyTenantRequest(request, context);
}

export async function HEAD(request: Request, context: { params: Promise<{ tenant: string; path?: string[] }> }) {
  return proxyTenantRequest(request, context);
}

export async function POST(request: Request, context: { params: Promise<{ tenant: string; path?: string[] }> }) {
  return proxyTenantRequest(request, context);
}

export async function PUT(request: Request, context: { params: Promise<{ tenant: string; path?: string[] }> }) {
  return proxyTenantRequest(request, context);
}

export async function PATCH(request: Request, context: { params: Promise<{ tenant: string; path?: string[] }> }) {
  return proxyTenantRequest(request, context);
}

export async function DELETE(request: Request, context: { params: Promise<{ tenant: string; path?: string[] }> }) {
  return proxyTenantRequest(request, context);
}

export async function OPTIONS(request: Request, context: { params: Promise<{ tenant: string; path?: string[] }> }) {
  return proxyTenantRequest(request, context);
}
