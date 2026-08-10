import { ReactNode } from "react";
import { notFound } from "next/navigation";
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from "@tanstack/react-query";
import { checkPlatformRoleService } from "@/shared/lib/supabase/services/platform-staff";
import { queryKeys } from "@/shared/lib/query";
import { requireUser } from "@/shared/lib/auth/requires/require-user";
import { Dir } from "@/shared/_components/dirs";
import Navbar from "../../(main)/_components/navbar";
import Footer from "../../(main)/_components/footer/Footer";
import AdminSidebar from "./_components/admin-sidebar";

interface AdminLayoutProps {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
    const { locale } = await params;

    // 1. Authenticate user
    const { user, supabase } = await requireUser(locale);

    // 2. Authorize platform role
    const role = await checkPlatformRoleService({
        supabase,
        profileId: user.id,
    });

    if (!role) {
        notFound();
    }

    // 3. Prefetch data into React Query Cache
    const queryClient = new QueryClient();

    await queryClient.prefetchQuery({
        queryKey: queryKeys.platformStaff.role(),
        queryFn: () => role,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="flex flex-col w-full h-full">
                {/* Admin Navigation Header / Sidebar */}
                <main className="flex-1">
                    <Navbar />
                    <Dir />
                    <div className="min-h-screen flex">
                        <AdminSidebar />
                        <div className="docs-content mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 md:px-8 md:py-10">
                            {children}
                        </div>
                    </div>
                    <Footer />
                </main>
            </div>
        </HydrationBoundary>
    );
}