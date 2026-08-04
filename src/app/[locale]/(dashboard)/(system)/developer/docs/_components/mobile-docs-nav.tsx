"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import DocsSidebar from "./docs-sidebar";

export default function MobileDocsNav() {
    const [open, setOpen] = useState(false);

    return (
        <div className="sticky top-0 z-40 flex w-full items-center border-b bg-background px-4 py-3 md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Open documentation navigation">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[min(20rem,85vw)] gap-0 p-0">
                    <SheetHeader className="border-b px-5 py-4">
                        <SheetTitle>Developer Documentation</SheetTitle>
                    </SheetHeader>
                    <div
                        className="min-h-0 flex-1"
                        onClick={(event) => {
                            if ((event.target as HTMLElement).closest("a")) setOpen(false);
                        }}
                    >
                        <DocsSidebar className="!static !flex !h-full !w-full !border-r-0 pt-4" />
                    </div>
                </SheetContent>
            </Sheet>
            <span className="ms-2 text-sm font-semibold">Developer Docs</span>
        </div>
    );
}
