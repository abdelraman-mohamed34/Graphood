"use client";

import { CircleUserRoundIcon } from "lucide-react";

export default function MembersEmpty() {
    return (
        <tr>
            <td
                colSpan={5}
                className="px-6 py-12 text-center text-sm text-muted-foreground"
            >
                <div className="flex flex-col items-center gap-2">
                    <CircleUserRoundIcon className="h-10 w-10 opacity-50" />

                    <p className="font-medium">
                        No members found.
                    </p>

                    <p className="text-xs">
                        Invite your first member to collaborate on this workspace.
                    </p>
                </div>
            </td>
        </tr>
    );
}