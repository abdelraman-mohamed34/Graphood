import type { ReactNode } from "react";

import DocsSidebar from "./_components/docs-sidebar";
import MobileDocsNav from "./_components/mobile-docs-nav";

interface DeveloperLayoutProps {
    children: ReactNode;
}

export default function DocsLayout({
    children,
}: DeveloperLayoutProps) {
    return (
        <div className="flex w-full min-w-0 flex-col md:flex-row">
            <MobileDocsNav />
            <DocsSidebar />
            <main className="min-w-0 flex-1">
                <div className="docs-content mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 md:px-8 md:py-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
