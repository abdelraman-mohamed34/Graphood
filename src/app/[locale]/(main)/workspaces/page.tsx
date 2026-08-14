"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Dir } from "@/shared/_components/dir";
import { useAuth } from "@/shared/lib/auth/auth-context";
import { useOnboarding } from "@/shared/lib/providers/onboarding-provider";
import { Tenant } from "@/shared/lib/schemas/tenants.schema";
import { WorkspaceCard } from "./_components/workspace-card";
import { CreateWorkspaceCard } from "./_components/create-workspace-card";

const DEFAULT_WORKSPACE_LOGO = "https://avatar.vercel.sh/shadcn1";

function getTenantLogo(tenant: Tenant) {
    return tenant.logo_url ?? DEFAULT_WORKSPACE_LOGO;
}

function getWorkspaceHref(slug: string) {
    return `/${slug}/dashboard/quickview`;
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring" as const,
            stiffness: 260,
            damping: 20,
        },
    },
};

export default function WorkspaceSelectionPage() {
    const { user } = useAuth();
    const { memberships } = useOnboarding();
    const t = useTranslations("dashboard.welcome");
    const searchParams = useSearchParams();
    const router = useRouter();
    const error = searchParams.get("error");

    useEffect(() => {
        if (error !== "unauthorized") return;

        toast.error(t("unauthorizedAccess"));

        router.replace(window.location.pathname, {
            scroll: false,
        });
    }, [error, router, t]);

    return (
        <>
            <Dir />

            <main className="min-h-screen w-full bg-background p-4 sm:p-8 md:p-12">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="mx-auto w-full max-w-5xl space-y-8"
                >
                    <motion.div
                        variants={itemVariants}
                        className="space-y-2"
                    >
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                            {t("greeting")}{" "}
                            {user?.first_name ??
                                t("defaultUserName")}
                        </h1>

                        <p className="text-sm text-muted-foreground">
                            {t("subtitle")}
                        </p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {memberships.map((membership) => (
                            <motion.div
                                key={membership.id}
                                variants={itemVariants}
                                whileHover={{
                                    y: -4,
                                    transition: {
                                        duration: 0.2,
                                    },
                                }}
                            >
                                <WorkspaceCard
                                    title={membership.tenant.name}
                                    role={membership.role}
                                    image={getTenantLogo(membership.tenant)}
                                    href={getWorkspaceHref(membership.tenant.slug)}
                                />
                            </motion.div>
                        ))}

                        <motion.div
                            variants={itemVariants}
                            whileHover={{
                                y: -4,
                                transition: {
                                    duration: 0.2,
                                },
                            }}
                        >
                            <CreateWorkspaceCard />
                        </motion.div>
                    </motion.div>
                </motion.div>
            </main>
        </>
    );
}
