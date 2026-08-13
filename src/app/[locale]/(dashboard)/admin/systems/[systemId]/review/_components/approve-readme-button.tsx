"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { approveSystemReadmeAction } from "@/shared/lib/actions/admin/systems.action";

export function ApproveReadmeButton({ systemId, disabled }: { systemId: string; disabled: boolean }) {
    const t = useTranslations("AdminSystems.review");
    const router = useRouter();
    const [pending, setPending] = useState(false);

    const approve = async () => {
        setPending(true);
        const result = await approveSystemReadmeAction(systemId);
        setPending(false);
        if (!result.success) {
            toast.error(t("approveError"));
            return;
        }
        toast.success(t("approved"));
        router.refresh();
    };

    return <Button onClick={approve} disabled={disabled || pending}>{pending ? t("approving") : t("approve")}</Button>;
}
