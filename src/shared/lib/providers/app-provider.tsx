"use client";

import { ReactNode } from "react";
import { AuthProvider } from "../auth/auth-context";
import { Profile } from "@/shared/lib/schemas/profiles.schema";
import { Membership } from "@/shared/lib/schemas/memberships.schema";
import { QueryProvider } from "./query-provider";
import { MembershipProvider } from "./membership-provider";

interface AppProviderProps {
  children: ReactNode;
  profile: Profile | null;
  memberships: Membership[] | null;
}

export function AppProvider({
  children,
  profile,
  memberships,
}: AppProviderProps) {
  return (
    <QueryProvider>
      <AuthProvider user={profile as any}>
        <MembershipProvider memberships={memberships}>
          {children}
        </MembershipProvider>
      </AuthProvider>
    </QueryProvider>
  );
}