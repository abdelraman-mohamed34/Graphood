import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import { AppProvider } from "@/shared/lib/providers/app-provider";
import { Toaster } from "@/components/ui/sonner";

import { locales } from "../../../public/data";

import { getMembershipsByProfileId } from "@/shared/lib/supabase/services/auth/membership/get-memberships-by-profile-id.service";
import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { fetchProfile } from "@/shared/lib/supabase/services/profile";
import type { MembershipWithTenant } from "@/shared/lib/supabase/services/auth/membership/get-memberships-by-profile-id.service";

export const metadata: Metadata = {
    title: "Graphood",
    description: "Multi-System SaaS Platform",
};

interface LocaleLayoutProps {
    children: React.ReactNode;
    params: Promise<{
        locale: string;
    }>;
}

export default async function LocaleLayout({
    children,
    params,
}: LocaleLayoutProps) {
    const { locale } = await params;

    if (!locales.includes(locale)) {
        notFound();
    }

    const dir = locale === "ar" ? "rtl" : "ltr";

    const supabasePromise = createSupabaseServerClient();
    const messagesPromise = getMessages();

    const [supabase, messages] = await Promise.all([
        supabasePromise,
        messagesPromise,
    ]);

    const user = await fetchUser(supabase);

    let profile = null;
    let memberships: MembershipWithTenant[] = [];

    if (user) {
        try {
            [profile, memberships] = await Promise.all([
                fetchProfile(supabase, user.id),
                getMembershipsByProfileId(supabase, user.id),
            ]);
        } catch {
        }
    }

    return (
        <div
            lang={locale}
            dir={dir}
            className={locale === "ar" ? "font-arabic" : "font-sans"}
        >
            <NextIntlClientProvider messages={messages}>
                <AppProvider
                    profile={profile}
                    memberships={memberships}
                >
                    {children}
                </AppProvider>

                <Toaster
                    dir={dir}
                    richColors
                    position={dir === "rtl" ? "bottom-left" : "bottom-right"}
                    toastOptions={{
                        classNames: {
                            toast: "group toast border-muted bg-background text-foreground shadow-xl rounded-xl border p-4 flex gap-3 w-full max-w-sm",
                            description: "text-muted-foreground text-xs",
                            error: "bg-destructive/5 text-destructive border-destructive/20",
                            success: "bg-emerald-500/5 text-emerald-500 border-emerald-500/20",
                            warning: "bg-amber-500/5 text-amber-500 border-amber-500/20",
                        },
                    }}
                />
            </NextIntlClientProvider>
        </div>
    );
}
