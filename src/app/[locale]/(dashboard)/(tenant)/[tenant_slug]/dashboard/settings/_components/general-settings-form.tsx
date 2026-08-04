"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Tenant } from "@/shared/lib/schemas/tenants.schema";
import { useTenant } from "@/shared/lib/hooks/tenants/use-tenant";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/shared/lib/supabase/client";
import Image from "next/image";
import { toast } from "sonner";
import { uploadTenantLogoService } from "@/shared/lib/supabase/services/storage";
import { useTranslations } from "next-intl";

type FormValues = {
    name: string;
    slug: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    address: string;
    timezone: string;
    logo: FileList;
    primary_color: string;
};

export async function uploadTenantLogo(
    tenantId: string,
    file: File
) {
    const supabase = createClient();

    return uploadTenantLogoService({
        supabase,
        tenantId,
        file,
    });
}

export function GeneralSettingsForm({ tenant }: { tenant: Tenant }) {
    const t = useTranslations("dashboard.settings");
    const { updateTenant, isUpdating } = useTenant();
    const [preview, setPreview] = useState<string | null>(
        tenant.logo_url || null
    );

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            name: tenant.name,
            slug: tenant.slug,
            email: tenant.email,
            phone: tenant.phone ?? "",
            country: tenant.country ?? "",
            city: tenant.city ?? "",
            address: tenant.address ?? "",
            timezone: tenant.timezone ?? "Africa/Cairo",
            primary_color: tenant.primary_color ?? "#000000",
        },
    });

    const logoRegister = register("logo");

    useEffect(() => {
        return () => {
            if (preview?.startsWith("blob:")) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);


    useEffect(() => {
        reset({
            name: tenant.name,
            slug: tenant.slug,
            email: tenant.email,
            phone: tenant.phone ?? "",
            country: tenant.country ?? "",
            city: tenant.city ?? "",
            address: tenant.address ?? "",
            timezone: tenant.timezone ?? "Africa/Cairo",
            primary_color: tenant.primary_color ?? "#000000",
        });
    }, [tenant, reset]);

    async function onSubmit(values: FormValues) {
        const file = values.logo?.[0];

        let logo_url = tenant.logo_url;

        if (file) {
            const allowedTypes = [
                "image/png",
                "image/jpeg",
                "image/jpg",
                "image/webp",
            ];

            const maxSize = 2 * 1024 * 1024; // 2 MB

            if (!allowedTypes.includes(file.type)) {
                toast.error(
                    t("feedback.invalidImageType")
                );
                return;
            }

            if (file.size > maxSize) {
                toast.error(
                    t("feedback.imageTooLarge")
                );
                return;
            }

            logo_url = await uploadTenantLogo(
                tenant.id,
                file
            );
        }

        updateTenant({
            name: values.name,
            slug: values.slug,
            email: values.email,
            phone: values.phone,
            country: values.country,
            city: values.city,
            address: values.address,
            timezone: values.timezone,
            primary_color: values.primary_color,
            logo_url,
        });
    }

    return (
        <Card className="ring-0 border-0 shadow-none flex items-center">
            <CardContent className="p-2 max-w-5xl w-full">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t("fields.name")}</Label>
                            <Input
                                id="name"
                                {...register("name")}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">{t("fields.slug")}</Label>
                            <Input
                                id="slug"
                                {...register("slug")}
                            />
                            {errors.slug && (
                                <p className="text-sm text-destructive">
                                    {errors.slug.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">{t("fields.email")}</Label>
                            <Input
                                id="email"
                                type="email"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">{t("fields.phone")}</Label>
                            <Input
                                id="phone"
                                {...register("phone")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country">{t("fields.country")}</Label>
                            <Input
                                id="country"
                                {...register("country")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city">{t("fields.city")}</Label>
                            <Input
                                id="city"
                                {...register("city")}
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">{t("fields.address")}</Label>
                            <Input
                                id="address"
                                {...register("address")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="timezone">{t("fields.timezone")}</Label>
                            <Input
                                id="timezone"
                                {...register("timezone")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="primary_color">
                                {t("fields.primaryColor")}
                            </Label>
                            <Input
                                id="primary_color"
                                type="color"
                                {...register("primary_color")}
                            />
                        </div>

                        <div className="space-y-3 md:col-span-2">
                            <Label>{t("logo.title")}</Label>

                            <label
                                htmlFor="logo"
                                className="group flex cursor-pointer items-center gap-5 rounded-xl border-2 border-dashed border-muted-foreground/25 p-5 transition hover:border-primary hover:bg-muted/40"
                            >
                                <div className="relative h-24 w-24 overflow-hidden rounded-xl border bg-muted">
                                    {preview ? (
                                        <Image
                                            src={preview}
                                            alt={t("logo.alt")}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                            {t("logo.none")}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <p className="font-medium">
                                        {t("logo.choose")}
                                    </p>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {t("logo.requirements")}
                                    </p>

                                    {preview?.startsWith("blob:") && (
                                        <p className="mt-2 text-sm text-primary">
                                            {t("logo.selected")}
                                        </p>
                                    )}
                                </div>

                                <Input
                                    id="logo"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    {...logoRegister}
                                    onChange={(e) => {
                                        logoRegister.onChange(e);
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        setPreview(URL.createObjectURL(file));
                                    }}
                                />
                            </label>
                        </div>


                    </div>

                    <div className="flex justify-end rtl:justify-start">
                        <Button
                            type="submit"
                            disabled={isUpdating}
                        >
                            {isUpdating ? t("saving") : t("save")}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
