import type { Metadata } from "next";
import { privateMetadata } from "@/shared/lib/seo";
import { SettingsLayoutClient } from "./_components/settings-layout-client";

export const metadata: Metadata = privateMetadata;
export default function SettingsLayout({ children }: { children: React.ReactNode }) { return <SettingsLayoutClient>{children}</SettingsLayoutClient>; }
