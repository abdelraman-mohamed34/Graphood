import type { Metadata } from "next";
import { privateMetadata } from "@/shared/lib/seo";
export const metadata: Metadata = privateMetadata;
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
