import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "@/shared/types/database.types";
import { sendSystemEmail } from "@/shared/lib/email/send-system-email";

type CookieToSet = {
    name: string;
    value: string;
    options: CookieOptions;
};

export async function GET(request: NextRequest) {
    const { searchParams, origin } = request.nextUrl;

    const code = searchParams.get("code");
    const next = sanitizeRedirect(searchParams.get("next"));

    if (!code) {
        return NextResponse.redirect(
            new URL("/en/login?error=missing_code", origin)
        );
    }

    const cookieStore = await cookies();
    const cookiesToSetInResponse: CookieToSet[] = [];

    try {
        const supabase = createServerClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            const cookieOptions = { ...options, path: "/" };
                            cookieStore.set(name, value, cookieOptions);
                            cookiesToSetInResponse.push({ name, value, options: cookieOptions });
                        });
                    },
                },
            }
        );

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error("[AUTH_CALLBACK]", error);
            return redirectWithCookies(
                new URL("/en/login?error=auth_failed", origin),
                cookiesToSetInResponse
            );
        }

        const user = data.user;

        if (!user) {
            console.error("[AUTH_CALLBACK] Session exchange returned no user");
            return redirectWithCookies(
                new URL("/en/login?error=auth_failed", origin),
                cookiesToSetInResponse
            );
        }

        const { firstName, lastName, avatarUrl } = parseGoogleMetadata(
            user.user_metadata
        );
        const callbackLocale = request.nextUrl.pathname.split("/")[1] === "ar" ? "ar" : "en";
        const isGoogleOAuth = user.app_metadata?.provider === "google" || user.identities?.some((identity) => identity.provider === "google");
        let isFirstProfile = false;

        if (isGoogleOAuth) {
            const { data: existingProfile, error: profileLookupError } = await supabase
                .from("profiles")
                .select("id")
                .eq("id", user.id)
                .maybeSingle();

            if (profileLookupError) {
                console.error("[AUTH_CALLBACK_PROFILE_LOOKUP]", profileLookupError);
            } else {
                isFirstProfile = !existingProfile;
            }
        }

        const { error: profileError } = await supabase.from("profiles").upsert(
            {
                id: user.id,
                email: user.email ?? null,
                first_name: firstName,
                last_name: lastName,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
        );

        if (profileError) {
            console.error("[AUTH_CALLBACK_PROFILE_UPSERT]", profileError);
            return redirectWithCookies(
                new URL("/en/login?error=profile_sync_failed", origin),
                cookiesToSetInResponse
            );
        }

        if (isFirstProfile && user.email) {
            // Welcome delivery is best-effort and must never delay OAuth completion.
            void sendSystemEmail({
                to: user.email,
                event: "WELCOME_USER",
                locale: callbackLocale,
                payload: {
                    name: [firstName, lastName].filter(Boolean).join(" ") || undefined,
                    loginUrl: `${origin}/${callbackLocale}/login`,
                },
            }).catch((emailError) => console.error("Welcome OAuth email dispatch failed:", emailError));
        }

        const redirectTarget = addWelcomeParams(next, {
            firstTime: isFirstProfile,
            name: [firstName, lastName].filter(Boolean).join(" "),
        });

        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <title>Authenticating...</title>
            </head>
            <body>
              <script>
                try {
                  if (window.opener && !window.opener.closed) {
                    window.opener.location.href = ${JSON.stringify(redirectTarget)};
                    window.close();
                  } else {
                    window.location.href = ${JSON.stringify(redirectTarget)};
                  }
                } catch (e) {
                  window.location.href = ${JSON.stringify(redirectTarget)};
                }
              </script>
            </body>
          </html>
        `;

        const response = new NextResponse(html, {
            headers: { "Content-Type": "text/html" },
        });

        cookiesToSetInResponse.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
        });

        return response;

    } catch (error) {
        console.error("[AUTH_CALLBACK_UNEXPECTED]", error);
        return redirectWithCookies(
            new URL("/en/login?error=server_error", origin),
            cookiesToSetInResponse
        );
    }
}

function sanitizeRedirect(next: string | null): string {
    if (!next) {
        return "/en/marketplace";
    }

    if (!next.startsWith("/") || next.startsWith("//")) {
        return "/en/marketplace";
    }

    return next;
}

function addWelcomeParams(next: string, { firstTime, name }: { firstTime: boolean; name: string }): string {
    const url = new URL(next, "https://graphood.local");
    url.searchParams.set("welcome", "true");
    if (firstTime) {
        url.searchParams.set("firstTime", "true");
        if (name) url.searchParams.set("name", name);
    }
    return `${url.pathname}${url.search}${url.hash}`;
}

function parseGoogleMetadata(metadata: Record<string, unknown>) {
    const fullName = stringValue(metadata.full_name);
    const nameParts = fullName.split(/\s+/).filter(Boolean);
    const firstName = stringValue(metadata.given_name) || nameParts[0] || "";
    const lastName =
        stringValue(metadata.family_name) || nameParts.slice(1).join(" ");

    return {
        firstName,
        lastName,
        avatarUrl:
            stringValue(metadata.avatar_url) ||
            stringValue(metadata.picture) ||
            null,
    };
}

function stringValue(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function redirectWithCookies(url: URL, cookiesToSet: CookieToSet[]) {
    const response = NextResponse.redirect(url, { status: 303 });

    cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
    });

    return response;
}
