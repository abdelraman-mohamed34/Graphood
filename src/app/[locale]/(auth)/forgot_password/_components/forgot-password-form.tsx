"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Mail, ArrowLeft, Loader2, KeyRound } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { useForgotPassword } from "@/shared/lib/hooks";

export default function ForgotPasswordPage() {
    const locale = useLocale();
    const t = useTranslations("auth");

    const [email, setEmail] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);

    const { resetPassword, isLoading, isSuccess } = useForgotPassword();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);

        if (!email) {
            setValidationError(t("errors.email_required") || "Email is required");
            return;
        }

        await resetPassword(email);
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <CardHeader className="space-y-1 text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <KeyRound className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">
                    {t("forgotPassword.title")}
                </CardTitle>
                <CardDescription>
                    {t("forgotPassword.description")}
                </CardDescription>
            </CardHeader>

            <CardContent>
                {isSuccess ? (
                    <div className="rounded-lg bg-emerald-500/10 p-4 text-center text-emerald-600 dark:text-emerald-400 space-y-2">
                        <p className="text-sm font-medium">
                            {t("forgotPassword.successMessage")}
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {validationError && (
                            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium text-center">
                                {validationError}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">{t("forgotPassword.emailLabel")}</Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder={t("forgotPassword.emailPlaceholder")}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    className="pl-10"
                                />
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>

                        <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t("forgotPassword.sending")}
                                </>
                            ) : (
                                t("forgotPassword.sendLink")
                            )}
                        </Button>
                    </form>
                )}
            </CardContent>

            <CardFooter className="justify-center border-t border-border/40 pt-4">
                <Link
                    href={`/${locale}/login`}
                    className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("forgotPassword.backToLogin")}
                </Link>
            </CardFooter>
        </div>
    );
}