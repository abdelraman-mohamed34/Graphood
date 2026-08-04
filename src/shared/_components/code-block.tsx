'use client';

import React, { useEffect, useState } from "react";
import Prism from "prismjs";
import { Check, Copy } from "lucide-react";

// استيراد الثيم الفاتح
import "prismjs/themes/prism.css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";

import { cn } from "@/lib/utils";

interface CodeBlockProps {
    code: string;
    language?: string;
    className?: string;
}

export function CodeBlock({
    code,
    language = "json",
    className,
}: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        Prism.highlightAll();
    }, [code, language]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={cn("relative group min-w-0 max-w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/70 p-1 transition-colors hover:border-zinc-300", className)}>
            {/* زر النسخ */}
            <button
                onClick={handleCopy}
                className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white/90 text-zinc-600 opacity-0 shadow-sm transition-all hover:bg-zinc-100 hover:text-zinc-900 group-hover:opacity-100"
                aria-label="Copy code"
            >
                {copied ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                    <Copy className="h-4 w-4" />
                )}
            </button>

            <pre className="!m-0 !max-w-full !bg-transparent !p-4 font-mono text-xs sm:text-sm overflow-x-auto overscroll-x-contain leading-relaxed [scrollbar-color:theme(colors.zinc.300)_transparent] [scrollbar-width:thin]">
                <code className={`language-${language}`}>
                    {code.trim()}
                </code>
            </pre>
        </div>
    );
}
