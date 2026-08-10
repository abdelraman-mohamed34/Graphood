import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

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
    const cookiesToSetInResponse: { name: string; value: string; options: any }[] = [];

    try {
        const supabase = createServerClient(
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

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error("[AUTH_CALLBACK]", error);
            return NextResponse.redirect(
                new URL("/en/login?error=auth_failed", origin),
                { status: 303 }
            );
        }

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
                    window.opener.location.href = "${next}";
                    window.close();
                  } else {
                    window.location.href = "${next}";
                  }
                } catch (e) {
                  window.location.href = "${next}";
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
        return NextResponse.redirect(
            new URL("/en/login?error=server_error", origin),
            { status: 303 }
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