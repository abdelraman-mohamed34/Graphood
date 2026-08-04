import type { ReactNode } from "react";
import Navbar from "@/app/[locale]/(main)/_components/navbar";
import { Dir } from "@/shared/_components/dirs";
import { SystemNavigationProvider } from "@/shared/_components/system-navigation-provider";

export default function DeveloperLayout({ children }: { children: ReactNode }) {
    return (
        <SystemNavigationProvider>
            <div className="flex min-h-screen flex-col bg-background antialiased">
                <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
                    <Navbar />
                    <Dir />
                </header>

                <main className="flex flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </SystemNavigationProvider>
    );
}
