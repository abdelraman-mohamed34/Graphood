import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);

    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/en/reset-password";

    if (!code) {
        return NextResponse.redirect(`${origin}/en/login?error=no-reset-code`);
    }

    const cookieStore = await cookies();

    const response = NextResponse.redirect(`${origin}${next}`);

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
                        const cookieOptions = {
                            ...options,
                            path: "/",
                        };

                        cookieStore.set(name, value, cookieOptions);
                        response.cookies.set(name, value, cookieOptions);
                    });
                },
            },
        }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        console.error("Reset password exchange error:", error);
        return NextResponse.redirect(`${origin}/en/login?error=reset-expired`);
    }

    return response;
}