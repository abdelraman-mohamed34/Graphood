"use client";

import { useParams } from "next/navigation";

import { CrownIcon } from "lucide-react";
import { toast } from "sonner";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/shared/_components/confirmation-dialog";

import { Membership } from "@/shared/lib/schemas/memberships.schema";
import { transferOwnershipAction } from "@/shared/lib/actions/memberships/transfer-ownership.action";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/query";

type Props = {
    member: Membership;
};

export default function TransferOwnership({
    member,
}: Props) {
    const t = useTranslations("dashboard.members");
    const errorT = useTranslations("global.errors");
    const params = useParams();
    const queryClient = useQueryClient();

    const locale =
        params.locale as string;

    const tenantSlug =
        params.tenant_slug as string;

    const transferMutation = useMutation({
        mutationFn: () => transferOwnershipAction(locale, tenantSlug, member.id),
        onSuccess: async (result) => {
            if (!result.success) return;
            await queryClient.invalidateQueries({
                queryKey: queryKeys.tenants.detail(tenantSlug),
            });
        },
    });

    async function onTransfer() {
        const result = await transferMutation.mutateAsync();

        if (!result.success) {
            toast.error(errorT("ownershipTransfer"));
            return;
        }

        toast.success(result.message);
    }

    return (
        <ConfirmationDialog
            trigger={
                <DropdownMenuItem
                    onSelect={(e) =>
                        e.preventDefault()
                    }
                >
                    <CrownIcon className="me-2 h-4 w-4" />
                    {t("actions.transfer")}
                </DropdownMenuItem>
            }
            title={t("actions.transfer")}
            description={t("actions.transferDescription", { name: `${member.profile?.first_name ?? ""} ${member.profile?.last_name ?? ""}`.trim() })}
            confirmText={t("actions.transferConfirm")}
            onConfirm={onTransfer}
        />
    );
}
