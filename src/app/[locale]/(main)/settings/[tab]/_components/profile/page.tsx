"use client";

import { AccountCard } from "./_components/account-card";
import { AvatarCard } from "./_components/avatar/avatar-card";

export default function ProfileSettingsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <AccountCard />
                <AvatarCard />
            </div>
        </div>
    );
}