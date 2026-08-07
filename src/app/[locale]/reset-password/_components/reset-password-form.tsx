"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { useResetPassword } from "@/shared/lib/hooks";

export default function ResetPasswordForm() {
    const t = useTranslations("auth");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const { updatePassword, isLoading } = useResetPassword();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);

        if (!password || !confirmPassword) {
            setValidationError(t("errors.fields_required") || "All fields are required");
            return;
        }

        if (password.length < 8) {
            setValidationError(
                t("errors.password_too_short") || "Password must be at least 8 characters"
            );
            return;
        }

        if (password !== confirmPassword) {
            setValidationError(
                t("errors.passwords_do_not_match") || "Passwords do not match"
            );
            return;
        }

        await updatePassword(password);
    };

    return (
        <Card className="w-full max-w-md mx-auto shadow-sm border-border/60">
            <CardHeader className="space-y-1 text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Lock className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">
                    {t("resetPassword.title")}
                </CardTitle>
                <CardDescription>
                    {t("resetPassword.description")}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {validationError && (
                        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium text-center">
                            {validationError}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="new-password">{t("resetPassword.newPassword")}</Label>
                        <div className="relative">
                            <Input
                                id="new-password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t("resetPassword.passwordPlaceholder")}
                                disabled={isLoading}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">{t("resetPassword.confirmPassword")}</Label>
                        <div className="relative">
                            <Input
                                id="confirm-password"
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder={t("resetPassword.passwordPlaceholder")}
                                disabled={isLoading}
                                className="pr-10"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t("resetPassword.updating")}
                            </>
                        ) : (
                            t("resetPassword.submit")
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}