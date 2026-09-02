"use client";

import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardAction,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

interface WorkspaceCardProps {
    title: string;
    description?: string;
    image: string;
    role?: string;
    href: string;
}

export function WorkspaceCard({
    title,
    description,
    image,
    role,
    href,
}: WorkspaceCardProps) {
    return (
        <Link href={href} className="block">
            <Card className="group overflow-hidden pt-0 transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl">
                <div className="relative aspect-video overflow-hidden">
                    <Image
                        src={image || "/icon.png"}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover brightness-60 grayscale transition-all duration-300 group-hover:scale-105 group-hover:brightness-75 dark:brightness-40"
                    />
                    <div className="absolute inset-0 bg-black/30 transition-colors duration-300 group-hover:bg-black/20" />
                </div>

                <CardHeader className="space-y-3">
                    {role && (
                        <CardAction>
                            <Badge variant="secondary">
                                {role}
                            </Badge>
                        </CardAction>
                    )}

                    <CardTitle className="line-clamp-1">
                        {title}
                    </CardTitle>

                    {description && (
                        <CardDescription className="line-clamp-2">
                            {description}
                        </CardDescription>
                    )}
                </CardHeader>
            </Card>
        </Link>
    );
}
