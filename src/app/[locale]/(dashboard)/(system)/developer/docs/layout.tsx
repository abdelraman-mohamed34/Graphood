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
        <div className="flex w-full min-w-0 max-w-full flex-col items-start overflow-x-clip md:flex-row">
            <MobileDocsNav />
            <DocsSidebar />
            <main className="w-full min-w-0 max-w-full flex-1">
                <div className="docs-content mx-auto w-full min-w-0 max-w-4xl px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
