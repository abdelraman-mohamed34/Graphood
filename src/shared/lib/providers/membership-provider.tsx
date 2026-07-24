"use client";

import { createContext, useContext, ReactNode } from "react";
import { Membership } from "@/shared/lib/schemas/memberships.schema";

type MembershipContextType = {
  memberships: Membership[] | null;
};

const MembershipContext = createContext<MembershipContextType | null>(null);

export function MembershipProvider({
  children,
  memberships,
}: {
  children: ReactNode;
  memberships: Membership[] | null;
}) {
  return (
    <MembershipContext.Provider value={{ memberships }}>
      {children}
    </MembershipContext.Provider>
  );
}

export function useMembership() {
  const ctx = useContext(MembershipContext);

  if (!ctx) {
    throw new Error("useMembership must be used inside MembershipProvider");
  }

  return ctx.memberships;
}