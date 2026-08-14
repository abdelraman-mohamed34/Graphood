import type { Metadata } from "next";
import { privateMetadata } from "@/shared/lib/seo";

export const metadata: Metadata = privateMetadata;
export default function DashboardLayout({ children }: { children: React.ReactNode }) { return children; }
