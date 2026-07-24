"use client";

import { MailXIcon } from "lucide-react";

export default function InvitationsEmpty() {
    return (
        <div className="rounded-xl border border-dashed py-14">
            <div className="flex flex-col items-center gap-3 text-center">
                <MailXIcon className="h-10 w-10 text-muted-foreground" />

                <div>
                    <h3 className="font-medium">
                        No pending invitations
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                        All invitations have been accepted or expired.
                    </p>
                </div>
            </div>
        </div>
    );
}