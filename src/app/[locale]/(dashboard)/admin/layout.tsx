// src/app/[locale]/(dashboard)/admin/layout.tsx

import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import { checkPlatformRoleService } from "@/shared/lib/supabase/services/platform-staff";
import { queryKeys } from "@/shared/lib/query";
import { requireUser } from "@/shared/lib/auth/requires/require-user";
import { Dir } from "@/shared/_components/dirs";
import Navbar from "../../(main)/_components/navbar";
import Footer from "../../(main)/_components/footer/Footer";

import AdminSidebar from "./_components/admin-sidebar";
import MobileAdminSidebar from "./_components/mobile-admin-sidebar";

interface AdminLayoutProps {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
    const { locale } = await params;

    // 1. Auth & Authorization
    const { user, supabase } = await requireUser(locale);
    const role = await checkPlatformRoleService({
        supabase,
        profileId: user.id,
    });

    if (!role) {
        notFound();
    }

    // 2. Query Prefetching
    const queryClient = new QueryClient();
    await queryClient.prefetchQuery({
        queryKey: queryKeys.platformStaff.role(),
        queryFn: () => role,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="flex min-h-screen w-full flex-col">
                <Navbar />
                <Dir />
                <MobileAdminSidebar />
                <div className="flex flex-1 w-full items-start">
                    <aside className="hidden md:block w-64 shrink-0 border-e min-h-[calc(100vh-7rem)] sticky top-15">
                        <AdminSidebar />
                    </aside>
                    <main className="flex-1 w-full min-w-0 px-4 py-6 sm:px-6 md:px-8 md:py-10">
                        {children}
                    </main>
                </div>

                <Footer />
            </div>
        </HydrationBoundary>
    );
}