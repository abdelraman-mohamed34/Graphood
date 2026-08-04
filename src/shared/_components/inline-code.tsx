import React from "react";
import { cn } from "@/lib/utils";

interface InlineCodeProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
    color?: "default" | "danger" | "success" | "warning";
}

export function InlineCode({
    children,
    color = "default",
    className,
    ...props
}: InlineCodeProps) {
    const colorVariants = {
        default: "bg-muted text-foreground border-border/50",
        danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    };

    return (
        <code
            className={cn(
                "relative rounded-md border px-[0.4rem] py-[0.15rem] font-mono text-xs sm:text-sm font-medium transition-colors",
                colorVariants[color],
                className
            )}
            {...props}
        >
            {children}
        </code>
    );
}