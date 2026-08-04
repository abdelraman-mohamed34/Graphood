// src/app/[locale]/(main)/settings/[tab]/_components/profile/_components/account-card.tsx
"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Info, Loader2, Mail, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useProfile } from "@/shared/lib/hooks/profile/use-profile";
import {
    UpdateProfileInput,
} from "@/shared/lib/actions/profile";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfileSchema } from "@/shared/lib/schemas/inputs/profile-inputs.schema";

export function AccountCard() {
    const locale = useLocale();
    const t = useTranslations("settings.profile");

    const {
        profile,
        isLoading,
        updateProfile,
        isUpdating,
    } = useProfile(locale);

    const form = useForm<UpdateProfileInput>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
        },
    });

    const {
        reset,
        control,
        handleSubmit,
        formState: {
            isDirty,
        },
    } = form;

    useEffect(() => {
        if (!profile) return;

        reset({
            first_name: profile.first_name ?? "",
            last_name: profile.last_name ?? "",
        });
    }, [profile, reset]);

    const onSubmit = async (
        values: UpdateProfileInput
    ) => {
        await toast.promise(
            updateProfile(values),
            {
                loading: t("savingChanges"),

                success: (result) => {
                    if (!result.success) {
                        throw new Error();
                    }

                    reset(values);

                    return t(
                        "profileUpdateSuccess"
                    );
                },

                error: t(
                    "profileUpdateError"
                ),
            }
        );
    };

    if (isLoading) {
        return (
            <div className="lg:col-span-2 rounded-xl border border-border/60 bg-card/30 p-6 backdrop-blur-sm">
                <div className="flex h-60 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    return (
        <div className="lg:col-span-2 rounded-xl border border-border/60 bg-card/30 p-6 backdrop-blur-sm">
            <div className="mb-6 flex items-center gap-2.5 border-b border-border/40 pb-4">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <User className="h-5 w-5 stroke-[1.5]" />
                </div>

                <div>
                    <h3 className="text-base font-semibold text-foreground">
                        {t("accountInfoTitle")}
                    </h3>

                    <p className="text-xs text-muted-foreground">
                        {t("accountInfoDescription")}
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form
                    onSubmit={handleSubmit(
                        onSubmit
                    )}
                    className="space-y-5"
                >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                            control={control}
                            name="first_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t("firstName")}
                                    </FormLabel>

                                    <FormControl>
                                        <Input
                                            placeholder={t(
                                                "firstNamePlaceholder"
                                            )}
                                            {...field}
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="last_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t("lastName")}
                                    </FormLabel>

                                    <FormControl>
                                        <Input
                                            placeholder={t(
                                                "lastNamePlaceholder"
                                            )}
                                            {...field}
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <FormLabel>
                            {t("email")}
                        </FormLabel>

                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                value={
                                    profile?.email ??
                                    ""
                                }
                                disabled
                                className="cursor-not-allowed bg-muted/40 pl-9"
                            />
                        </div>

                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Info className="h-3.5 w-3.5" />

                            {t(
                                "emailCannotBeChanged"
                            )}
                        </p>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button
                            type="submit"
                            disabled={
                                isUpdating ||
                                !isDirty
                            }
                        >
                            {isUpdating && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}

                            {t(
                                "saveChanges"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}