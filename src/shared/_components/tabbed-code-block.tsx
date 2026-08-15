'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

interface CodeTab {
    label: string;
    command: string;
    commandName: string;
    commandNameClassName?: string;
}

interface TabbedCodeBlockProps {
    tabs: readonly CodeTab[];
    className?: string;
}

export function TabbedCodeBlock({ tabs, className }: TabbedCodeBlockProps) {
    const [hasMounted, setHasMounted] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [copied, setCopied] = useState(false);
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const selectedTab = tabs[activeTab] ?? tabs[0];

    useEffect(() => {
        // This component is intentionally client-only to keep its interactive
        // tab tree out of the server HTML and initial hydration pass.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHasMounted(true);
    }, []);

    if (!hasMounted || !selectedTab) return null;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(selectedTab.command);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
    };

    const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
        let nextIndex = index;

        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = tabs.length - 1;
        else return;

        event.preventDefault();
        setActiveTab(nextIndex);
        setCopied(false);
        tabRefs.current[nextIndex]?.focus();
    };

    return (
        <div
            dir="ltr"
            className={cn(
                "group min-w-0 max-w-full gap-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/70 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950/70 dark:hover:border-zinc-700",
                className,
            )}
        >
            <div
                role="tablist"
                aria-label="Package manager"
                className="flex h-10 w-full items-center justify-start rounded-none border-b border-gray-200 bg-zinc-100/80 p-0 px-1 dark:border-gray-800 dark:bg-zinc-900/80"
            >
                {tabs.map((tab, index) => {
                    const isActive = index === activeTab;

                    return (
                        <button
                            key={tab.label}
                            ref={(element) => { tabRefs.current[index] = element; }}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            tabIndex={isActive ? 0 : -1}
                            onClick={() => {
                                setActiveTab(index);
                                setCopied(false);
                            }}
                            onKeyDown={(event) => handleTabKeyDown(event, index)}
                            className={cn(
                                "h-10 min-w-16 flex-none rounded-none border-0 border-b-2 border-b-transparent bg-transparent px-4 text-xs font-medium tracking-wide text-zinc-500 shadow-none after:hidden hover:text-zinc-900 focus-visible:z-10 dark:bg-transparent dark:text-zinc-500 dark:hover:text-zinc-100",
                                isActive && "border-b-primary bg-white/70 text-zinc-950 dark:bg-zinc-800/70 dark:text-zinc-50",
                            )}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="relative p-1">
                <button
                    type="button"
                    onClick={handleCopy}
                    className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white/90 text-zinc-600 opacity-0 shadow-sm transition-all hover:bg-zinc-100 hover:text-zinc-900 focus-visible:opacity-100 group-hover:opacity-100 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                    aria-label="Copy code"
                >
                    {copied ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                        <Copy className="h-4 w-4" />
                    )}
                </button>

                <pre
                    role="tabpanel"
                    aria-live="polite"
                    className="!m-0 !max-w-full overflow-x-auto overscroll-x-contain !bg-transparent !p-4 pe-12 font-mono text-xs leading-relaxed text-zinc-800 [scrollbar-color:theme(colors.zinc.300)_transparent] [scrollbar-width:thin] sm:text-sm dark:text-zinc-200 dark:[scrollbar-color:theme(colors.zinc.700)_transparent]"
                >
                    <code key={selectedTab.label} className="animate-in fade-in duration-150">
                        <span className={selectedTab.commandNameClassName}>
                            {selectedTab.commandName}
                        </span>
                        {selectedTab.command.slice(selectedTab.commandName.length)}
                    </code>
                </pre>
            </div>
        </div>
    );
}
