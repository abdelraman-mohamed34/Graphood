"use client";

import { useEffect, useMemo, useRef } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-typescript";

import { renderSafeMarkdown } from "@/shared/lib/markdown";

export function MarkdownRenderer({ markdown, className = "" }: { markdown: string; className?: string }) {
    const rootRef = useRef<HTMLDivElement>(null);
    const html = useMemo(() => renderSafeMarkdown(markdown), [markdown]);

    useEffect(() => {
        if (rootRef.current) Prism.highlightAllUnder(rootRef.current);
    }, [html]);

    return (
        <div
            ref={rootRef}
            className={`markdown-body min-w-0 break-words text-sm leading-7 ${className}`}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
