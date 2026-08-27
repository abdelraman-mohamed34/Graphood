"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SubmitHandler } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { X, Check, Search } from "lucide-react";
import { toast } from "sonner";

import { useSystem } from "@/shared/lib/hooks";
import { useTags } from "@/shared/lib/hooks/tags/use-tag";

import {
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";

import {
    getCreateSystemSchema,
    type CreateSystemInput,
} from "@/shared/lib/schemas/systems.schema";
import { MarkdownEditor } from "@/shared/_components/markdown-editor";
import { SystemImageField } from "@/components/systems/system-image-field";

export default function CreateSystemForm() {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("developer.systems.create");

    const { createSystem, isCreating } = useSystem();
    const { data: tagsData, isLoading: isLoadingTags } = useTags();
    const availableCategories = useMemo(() => tagsData ?? [], [tagsData]);
    const formSchema = useMemo(
        () => getCreateSystemSchema((key) => t(key)),
        [t],
    );

    const [open, setOpen] = useState(false);
    const [categoryQuery, setCategoryQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);

    const form = useForm<CreateSystemInput>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            image_url: "",
            launch_url_template: "",
            readme: "",
            tags: [],
            starter_price: 0,
            pro_price: 0,
            business_price: 0,
            reseller_price: 0,
            exclusive_price: 0,
            currency: "EGP",
            is_public: true,
            status: "PENDING",
        },
    });

    const selectedTagIds = useWatch({
        control: form.control,
        name: "tags",
        defaultValue: form.getValues("tags"),
    });
    const imageUrl = useWatch({
        control: form.control,
        name: "image_url",
        defaultValue: form.getValues("image_url"),
    });
    const readme = useWatch({
        control: form.control,
        name: "readme",
        defaultValue: form.getValues("readme"),
    });
    const selectedTags = useMemo(
        () => selectedTagIds
            .map((tagId) => availableCategories.find((tag) => tag.id === tagId))
            .filter((tag) => tag !== undefined),
        [availableCategories, selectedTagIds],
    );

    const filteredCategories = useMemo(() => {
        const normalizedQuery = categoryQuery.trim().toLocaleLowerCase(locale);

        return availableCategories.filter((tag) => {
            const tagName = locale === "ar" ? tag.name_ar : tag.name_en;
            return !selectedTagIds.includes(tag.id) &&
                tagName.toLocaleLowerCase(locale).includes(normalizedQuery);
        });
    }, [availableCategories, categoryQuery, locale, selectedTagIds]);

    const handleSelectTag = (tagId: string) => {
        if (selectedTagIds.includes(tagId)) return;

        form.setValue("tags", [...selectedTagIds, tagId], {
            shouldValidate: true,
            shouldDirty: true,
        });
        setCategoryQuery("");
        setActiveIndex(0);
    };

    const handleRemoveTag = (tagId: string) => {
        form.setValue("tags", selectedTagIds.filter((id) => id !== tagId), {
            shouldValidate: true,
            shouldDirty: true,
        });
    };

    const onSubmit: SubmitHandler<CreateSystemInput> = async (values) => {
        try {
            const createdSystem = await createSystem(values);
            const systemId = createdSystem?.system?.id;

            toast.success(t("notifications.success"));

            if (systemId) {
                router.push(`/developer/systems/${systemId}/api-keys`);
            }
        } catch {
            toast.error(t("notifications.error"));
        }
    };

    return (
        <section style={{ border: "none" }} className="mx-auto w-full max-w-6xl">
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 text-start">
                    <FieldGroup>
                        <div className="space-y-5">
                            <Field>
                                <FieldLabel>{t("fields.name.label")}</FieldLabel>
                                <Input
                                    placeholder={t("fields.name.placeholder")}
                                    {...form.register("name")}
                                />
                                <FieldError errors={[form.formState.errors.name]} />
                            </Field>

                            <Field>
                                <FieldLabel>{t("fields.slug.label")}</FieldLabel>
                                <Input
                                    placeholder={t("fields.slug.placeholder")}
                                    {...form.register("slug")}
                                />
                                <FieldDescription>{t("fields.slug.description")}</FieldDescription>
                                <FieldError errors={[form.formState.errors.slug]} />
                            </Field>
                        </div>

                        <Field>
                            <FieldLabel>{t("fields.description.label")}</FieldLabel>
                            <Textarea
                                rows={4}
                                placeholder={t("fields.description.placeholder")}
                                className="resize-y min-h-[100px]"
                                maxLength={250}
                                {...form.register("description")}
                            />
                            <FieldError errors={[form.formState.errors.description]} />
                        </Field>

                        <Field>
                            <FieldLabel>{t("fields.launchUrlTemplate.label")}</FieldLabel>
                            <Input
                                type="url"
                                placeholder={t("fields.launchUrlTemplate.placeholder")}
                                {...form.register("launch_url_template")}
                            />
                            <FieldDescription>{t("fields.launchUrlTemplate.description")}</FieldDescription>
                            <FieldError errors={[form.formState.errors.launch_url_template]} />
                        </Field>

                        <SystemImageField
                            value={imageUrl}
                            onChange={(url) => form.setValue("image_url", url, { shouldDirty: true, shouldValidate: true })}
                            disabled={isCreating}
                            labels={{
                                label: t("fields.image.label"),
                                description: t("fields.image.description"),
                                choose: t("fields.image.choose"),
                                replace: t("fields.image.replace"),
                                remove: t("fields.image.remove"),
                                uploading: t("fields.image.uploading"),
                                previewAlt: t("fields.image.previewAlt"),
                                fallback: t("fields.image.fallback"),
                                errors: {
                                    invalidType: t("fields.image.errors.invalidType"),
                                    tooLarge: t("fields.image.errors.tooLarge"),
                                    unauthenticated: t("fields.image.errors.unauthenticated"),
                                    uploadFailed: t("fields.image.errors.uploadFailed"),
                                },
                            }}
                        />

                        <Field>
                            <FieldLabel>{t("fields.readme.label")}</FieldLabel>
                            <FieldDescription>{t("fields.readme.description")}</FieldDescription>
                            <MarkdownEditor
                                value={readme ?? ""}
                                onChange={(value) => form.setValue("readme", value, { shouldDirty: true, shouldValidate: true })}
                                labels={{ write: t("fields.readme.write"), preview: t("fields.readme.preview"), placeholder: t("fields.readme.placeholder"), empty: t("fields.readme.empty") }}
                            />
                            <FieldError errors={[form.formState.errors.readme]} />
                        </Field>

                        <div className="flex gap-4">
                            {/* Category: Multi-Select Combobox (LinkedIn Skills Style) */}
                            <Field className="space-y-2">
                                <FieldLabel>{t("fields.category.label")}</FieldLabel>

                                <div
                                    dir={locale === "ar" ? "rtl" : "ltr"}
                                    className="relative"
                                    onBlur={(event) => {
                                        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
                                    }}
                                >
                                    <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent p-2 shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                                        <Search className="size-4 shrink-0 text-muted-foreground" />
                                        {selectedTags.map((tag) => {
                                            const tagName = locale === "ar" ? tag.name_ar : tag.name_en;
                                            return (
                                                <Badge
                                                    key={tag.id}
                                                    variant="secondary"
                                                    className="h-6 max-w-full gap-1.5 rounded-md px-2 text-xs"
                                                >
                                                    <span className="truncate text-start">{tagName}</span>
                                                    <button
                                                        type="button"
                                                        aria-label={t("fields.category.remove", { category: tagName })}
                                                        onMouseDown={(event) => event.preventDefault()}
                                                        onClick={() => handleRemoveTag(tag.id)}
                                                        className="ms-auto shrink-0 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                    >
                                                        <X className="size-3" />
                                                    </button>
                                                </Badge>
                                            );
                                        })}
                                        <input
                                            role="combobox"
                                            aria-expanded={open}
                                            aria-controls="category-options"
                                            aria-autocomplete="list"
                                            value={categoryQuery}
                                            placeholder={t("fields.category.searchPlaceholder")}
                                            onFocus={() => setOpen(true)}
                                            onChange={(event) => {
                                                setCategoryQuery(event.target.value);
                                                setActiveIndex(0);
                                                setOpen(true);
                                            }}
                                            onKeyDown={(event) => {
                                                if (event.key === "Backspace" && !categoryQuery && selectedTagIds.length > 0) {
                                                    event.preventDefault();
                                                    handleRemoveTag(selectedTagIds[selectedTagIds.length - 1]);
                                                } else if (event.key === "ArrowDown") {
                                                    event.preventDefault();
                                                    setOpen(true);
                                                    setActiveIndex((index) => Math.min(index + 1, filteredCategories.length - 1));
                                                } else if (event.key === "ArrowUp") {
                                                    event.preventDefault();
                                                    setActiveIndex((index) => Math.max(index - 1, 0));
                                                } else if (event.key === "Enter" && open && filteredCategories[activeIndex]) {
                                                    event.preventDefault();
                                                    handleSelectTag(filteredCategories[activeIndex].id);
                                                } else if (event.key === "Escape") {
                                                    setOpen(false);
                                                }
                                            }}
                                            className="h-6 min-w-32 flex-1 bg-transparent text-start text-sm outline-none placeholder:text-muted-foreground"
                                        />
                                    </div>

                                    {open && (
                                        <div id="category-options" role="listbox" className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                                            {isLoadingTags ? (
                                                <p className="px-2 py-6 text-center text-sm text-muted-foreground">{t("fields.category.loading")}</p>
                                            ) : filteredCategories.length === 0 ? (
                                                <p className="px-2 py-6 text-center text-sm text-muted-foreground">{t("fields.category.empty")}</p>
                                            ) : (
                                                filteredCategories.map((category, index) => {
                                                    const categoryName = locale === "ar" ? category.name_ar : category.name_en;
                                                    return (
                                                        <button
                                                            key={category.id}
                                                            type="button"
                                                            role="option"
                                                            aria-selected={index === activeIndex}
                                                            onMouseEnter={() => setActiveIndex(index)}
                                                            onClick={() => handleSelectTag(category.id)}
                                                            className={`flex w-full items-center justify-between rounded-sm px-2 py-2 text-start text-sm ${index === activeIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"}`}
                                                        >
                                                            <span>{categoryName}</span>
                                                            <Check className="size-4 opacity-0" />
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                </div>

                                <FieldError errors={[form.formState.errors.tags]} />
                            </Field>
                        </div>
                    </FieldGroup>

                    <hr className="border-border/60" />

                    {/* Subscription Pricing */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-base font-semibold">{t("pricing.subscriptionTitle")}</h3>
                            <p className="text-xs text-muted-foreground">{t("pricing.subscriptionSubtitle")}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Field>
                                <FieldLabel>{t("fields.starterPrice.label")}</FieldLabel>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    {...form.register("starter_price", { valueAsNumber: true })}
                                />
                                <FieldError errors={[form.formState.errors.starter_price]} />
                            </Field>

                            <Field>
                                <FieldLabel>{t("fields.proPrice.label")}</FieldLabel>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    {...form.register("pro_price", { valueAsNumber: true })}
                                />
                                <FieldError errors={[form.formState.errors.pro_price]} />
                            </Field>

                            <Field>
                                <FieldLabel>{t("fields.businessPrice.label")}</FieldLabel>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    {...form.register("business_price", { valueAsNumber: true })}
                                />
                                <FieldError errors={[form.formState.errors.business_price]} />
                            </Field>
                        </div>
                    </div>

                    <hr className="border-border/60" />

                    {/* License Pricing */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-base font-semibold">{t("pricing.licenseTitle")}</h3>
                            <p className="text-xs text-muted-foreground">{t("pricing.licenseSubtitle")}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel>{t("fields.resellerPrice.label")}</FieldLabel>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    {...form.register("reseller_price", { valueAsNumber: true })}
                                />
                                <FieldError errors={[form.formState.errors.reseller_price]} />
                            </Field>

                            <Field>
                                <FieldLabel>{t("fields.exclusivePrice.label")}</FieldLabel>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    {...form.register("exclusive_price", { valueAsNumber: true })}
                                />
                                <FieldError errors={[form.formState.errors.exclusive_price]} />
                            </Field>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end pt-4 border-t">
                        <Button
                            type="submit"
                            disabled={isCreating}
                            className="min-w-[140px]"
                        >
                            {isCreating ? t("submitLoading") : t("submit")}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </section>
    );
}
