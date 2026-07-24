"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import { CrownIcon } from "lucide-react";
import { toast } from "sonner";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/shared/_components/confirmation-dialog";

import { Membership } from "@/shared/lib/schemas/memberships.schema";
import { transferOwnershipAction } from "@/shared/lib/actions/memberships/transfer-ownership.action";

type Props = {
    member: Membership;
};

export default function TransferOwnership({
    member,
}: Props) {
    const [loading, setLoading] =
        useState(false);

    const params = useParams();

    const locale =
        params.locale as string;

    const tenantSlug =
        params.tenant_slug as string;

    async function onTransfer() {
        setLoading(true);

        try {
            const result =
                await transferOwnershipAction(
                    locale,
                    tenantSlug,
                    member.id
                );

            if (!result.success) {
                toast.error(result.message);
                return;
            }

            toast.success(result.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <ConfirmationDialog
            trigger={
                <DropdownMenuItem
                    onSelect={(e) =>
                        e.preventDefault()
                    }
                >
                    <CrownIcon className="mr-2 h-4 w-4" />
                    Transfer Ownership
                </DropdownMenuItem>
            }
            title="Transfer Ownership"
            description={`Transfer workspace ownership to ${member.profile?.first_name} ${member.profile?.last_name}? You will become an Admin.`}
            confirmText="Transfer"
            loading={loading}
            onConfirm={onTransfer}
        />
    );
}