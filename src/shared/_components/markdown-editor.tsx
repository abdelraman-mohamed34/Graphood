"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownRenderer } from "@/shared/_components/markdown-renderer";
import { SYSTEM_README_MAX_LENGTH } from "@/shared/lib/markdown";

type Props = {
    value: string;
    onChange: (value: string) => void;
    labels?: { write: string; preview: string; placeholder: string; empty: string; editorLabel?: string };
    dir?: "ltr" | "rtl";
};

export function MarkdownEditor({ value, onChange, labels, dir = "ltr" }: Props) {
    const [tab, setTab] = useState<"write" | "preview">("write");
    const copy = labels ?? {
        write: "Write",
        preview: "Preview",
        placeholder: "Add installation steps, features, examples, and other documentation…",
        empty: "Nothing to preview yet.",
    };

    return (
        <div dir={dir} className="overflow-hidden rounded-lg border bg-background text-start">
            <div className="flex border-b bg-muted/30" role="tablist" aria-label={copy.editorLabel ?? "README editor"}>
                <button type="button" role="tab" aria-selected={tab === "write"} onClick={() => setTab("write")} className={`border-b-2 px-4 py-2 text-sm ${tab === "write" ? "border-primary font-medium" : "border-transparent"}`}>{copy.write}</button>
                <button type="button" role="tab" aria-selected={tab === "preview"} onClick={() => setTab("preview")} className={`border-b-2 px-4 py-2 text-sm ${tab === "preview" ? "border-primary font-medium" : "border-transparent"}`}>{copy.preview}</button>
                <span className="ms-auto self-center px-3 text-xs text-muted-foreground">{value.length.toLocaleString()} / {SYSTEM_README_MAX_LENGTH.toLocaleString()}</span>
            </div>
            <div hidden={tab !== "write"}>
                <Textarea value={value} onChange={(event) => onChange(event.target.value)} maxLength={SYSTEM_README_MAX_LENGTH} rows={16} className="min-h-72 resize-y rounded-none border-0 font-mono text-sm focus-visible:ring-0" placeholder={copy.placeholder} />
            </div>
            <div hidden={tab !== "preview"} className="min-h-72 p-5">
                {value.trim() ? <MarkdownRenderer markdown={value} /> : <p className="text-sm text-muted-foreground">{copy.empty}</p>}
            </div>
        </div>
    );
}
