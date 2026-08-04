"use client";

import { useState } from "react";
import { Copy, Eye, EyeOff, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ApiKeyDisplayProps {
    apiKey: string;
}

export function ApiKeyDisplay({ apiKey }: ApiKeyDisplayProps) {
    const [visible, setVisible] = useState(false);
    const [copied, setCopied] = useState(false);

    const maskedKey = `${apiKey.slice(0, 10)}${"*".repeat(25)}`;

    async function copyKey() {
        await navigator.clipboard.writeText(apiKey);
        setCopied(true);
        toast.success("API Key copied successfully");

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    }

    return (
        <div dir="ltr" className="flex w-full items-center justify-between gap-3 rounded-xl border bg-muted/50 p-3 shadow-inner">
            <code className="flex-1 break-all font-mono text-xs md:text-sm text-foreground px-2">
                {visible ? apiKey : maskedKey}
            </code>

            <div className="flex items-center gap-1 shrink-0">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setVisible((prev) => !prev)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                    title={visible ? "Hide API Key" : "Show API Key"}
                >
                    {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={copyKey}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                    title="Copy API Key"
                >
                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </Button>
            </div>
        </div>
    );
}