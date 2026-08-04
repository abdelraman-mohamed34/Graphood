"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Tenant } from "@/shared/lib/schemas/tenants.schema";
import { useTenant } from "@/shared/lib/hooks/tenants/use-tenant";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

type Props = {
    tenant: Tenant;
};

type FormValues = {
    timezone: string;
    country: string;
    city: string;
    address: string;
};

export function LocalizationForm({ tenant }: Props) {
    const t = useTranslations("dashboard.settings");
    const { updateTenant, isUpdating } = useTenant();

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            timezone: tenant.timezone ?? "Africa/Cairo",
            country: tenant.country ?? "",
            city: tenant.city ?? "",
            address: tenant.address ?? "",
        },
    });

    useEffect(() => {
        reset({
            timezone: tenant.timezone ?? "Africa/Cairo",
            country: tenant.country ?? "",
            city: tenant.city ?? "",
            address: tenant.address ?? "",
        });
    }, [tenant, reset]);

    function onSubmit(values: FormValues) {
        updateTenant({
            name: tenant.name,
            slug: tenant.slug,
            email: tenant.email,
            phone: tenant.phone,
            logo_url: tenant.logo_url,
            primary_color: tenant.primary_color,
            timezone: values.timezone,
            country: values.country,
            city: values.city,
            address: values.address,
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("localization.title")}</CardTitle>
            </CardHeader>

            <CardContent>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>{t("fields.timezone")}</Label>

                            <Controller
                                control={control}
                                name="timezone"
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("localization.selectTimezone")} />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="Africa/Cairo">
                                                Africa/Cairo
                                            </SelectItem>

                                            <SelectItem value="UTC">
                                                UTC
                                            </SelectItem>

                                            <SelectItem value="Europe/London">
                                                Europe/London
                                            </SelectItem>

                                            <SelectItem value="Europe/Paris">
                                                Europe/Paris
                                            </SelectItem>

                                            <SelectItem value="Asia/Dubai">
                                                Asia/Dubai
                                            </SelectItem>

                                            <SelectItem value="America/New_York">
                                                America/New_York
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />

                            {errors.timezone && (
                                <p className="text-sm text-destructive">
                                    {errors.timezone.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country">
                                {t("fields.country")}
                            </Label>

                            <Input
                                id="country"
                                {...register("country")}
                            />

                            {errors.country && (
                                <p className="text-sm text-destructive">
                                    {errors.country.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city">
                                {t("fields.city")}
                            </Label>

                            <Input
                                id="city"
                                {...register("city")}
                            />

                            {errors.city && (
                                <p className="text-sm text-destructive">
                                    {errors.city.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">
                                {t("fields.address")}
                            </Label>

                            <Textarea
                                id="address"
                                rows={4}
                                {...register("address")}
                            />

                            {errors.address && (
                                <p className="text-sm text-destructive">
                                    {errors.address.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end rtl:justify-start">
                        <Button
                            type="submit"
                            disabled={isUpdating}
                        >
                            {isUpdating
                                ? t("saving")
                                : t("localization.save")}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
