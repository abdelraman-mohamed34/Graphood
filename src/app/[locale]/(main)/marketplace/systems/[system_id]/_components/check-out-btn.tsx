"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/shared/lib/auth/auth-context";
import { useQuery } from "@tanstack/react-query";
import { getMarketplaceAccessAction } from "@/shared/lib/actions/billing/marketplace-access.action";

export default function CheckoutButton({ systemId }: { systemId: string }) {
    const t = useTranslations("marketplace.details");
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const accessQuery = useQuery({
        queryKey: ["marketplace", "access", systemId, user?.id],
        queryFn: () => getMarketplaceAccessAction({ systemId }),
        enabled: Boolean(user?.id),
    });
    const access = accessQuery.data;

    const handleClick = () => {
        if (!user) {
            toast.error(t("signInRequired"));
            return;
        }

        if (access?.tenantSlug && access.licenseType !== "SUBSCRIPTION") {
            router.push(`/${access.tenantSlug}/dashboard/quickview`);
            return;
        }

        router.push(`/marketplace/systems/${systemId}/get`);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isLoading || accessQuery.isLoading}
            aria-disabled={isLoading || accessQuery.isLoading}
            className="group relative flex w-full items-center justify-center overflow-hidden rounded bg-primary px-6 py-3.5 text-sm font-medium text-white shadow-md transition-[background-color,box-shadow,transform] duration-150 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none dark:bg-white dark:text-black dark:hover:bg-neutral-100"
        >
            <span className="z-10 flex items-center gap-2.5">
                <ShoppingBag className="size-4 text-neutral-400 transition-transform duration-200 group-hover:scale-110 dark:text-neutral-600" aria-hidden="true" />
                <span>{access?.tenantSlug
                    ? access.licenseType === "SUBSCRIPTION" ? "ترقية الباقة" : "الانتقال لمساحة العمل"
                    : t("getNow")}</span>
            </span>
        </button>
    );
}
