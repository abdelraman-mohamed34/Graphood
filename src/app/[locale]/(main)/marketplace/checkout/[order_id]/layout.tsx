"use server";

import React from "react";
import { redirect, notFound } from "next/navigation";
import {
    HydrationBoundary,
    dehydrate,
} from "@tanstack/react-query";
import { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";
import { getOrderById } from "@/shared/lib/supabase/services/billing";
import { Dir } from "@/shared/_components/dir";
import { createQueryClient, queryKeys } from "@/shared/lib/query";

interface CheckoutLayoutProps {
    children: React.ReactNode;
    params: Promise<{
        locale: string;
        order_id: string;
    }>;
}

export default async function CheckoutLayout({
    children,
    params,
}: CheckoutLayoutProps) {
    const { locale, order_id } = await params;

    if (!order_id) {
        notFound();
    }

    const supabase: SupabaseClient =
        await createSupabaseServerClient();

    const user = await fetchUser(supabase);

    if (!user) {
        redirect(`/${locale}/login`);
    }

    const order = await getOrderById({
        orderId: order_id,
    });

    if (!order) {
        notFound();
    }

    if (order.profile_id !== user.id) {
        notFound();
    }

    const queryClient = createQueryClient();

    queryClient.setQueryData(
        queryKeys.orders.detail(order_id),
        order
    );

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Dir unroutableSegments={["checkout"]} />
            {children}
        </HydrationBoundary>
    );
}
