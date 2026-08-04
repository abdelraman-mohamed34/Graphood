"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SubmitHandler } from "react-hook-form";

import { useSystem } from "@/shared/lib/hooks";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import {
    createSystemSchema,
    type CreateSystemInput,
} from "@/shared/lib/schemas/systems.schema";
import { toast } from "sonner";


export default function CreateSystemForm() {
    const router = useRouter();

    const { createSystem, isCreating } = useSystem();
    const form = useForm<CreateSystemInput>({

        resolver: zodResolver(createSystemSchema),
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            category: "",
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

    const onSubmit: SubmitHandler<CreateSystemInput> = async (values) => {
        try {
            const createdSystem = await createSystem(values);
            const systemId = createdSystem?.system?.id;

            toast.success("System created successfully.");

            if (systemId) {
                router.push(`/developer/system/${systemId}/api-keys`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to create system.");
        }
    };

    return (
        <Card className="mx-auto max-w-3xl shadow-sm border rounded-2xl">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Create New System</CardTitle>
                <CardDescription>
                    Create your system to start integrating with Graphood.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                >
                    {/* General Info */}
                    <FieldGroup className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel>System Name</FieldLabel>
                                <Input
                                    placeholder="My Awesome CRM"
                                    {...form.register("name")}
                                />
                                <FieldError errors={[form.formState.errors.name]} />
                            </Field>

                            <Field>
                                <FieldLabel>Slug</FieldLabel>
                                <Input
                                    placeholder="awesome-crm"
                                    {...form.register("slug")}
                                />
                                <FieldDescription>Used in public URLs.</FieldDescription>
                                <FieldError errors={[form.formState.errors.slug]} />
                            </Field>
                        </div>

                        <Field>
                            <FieldLabel>Description</FieldLabel>
                            <Textarea
                                rows={4}
                                placeholder="Describe your system capabilities and features..."
                                className="resize-none"
                                {...form.register("description")}
                            />
                            <FieldError errors={[form.formState.errors.description]} />
                        </Field>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel>Category</FieldLabel>
                                <Input
                                    placeholder="CRM, ERP, Billing..."
                                    {...form.register("category")}
                                />
                                <FieldError errors={[form.formState.errors.category]} />
                            </Field>

                            <Field>
                                <FieldLabel>Tags</FieldLabel>
                                <Input
                                    placeholder="crm, sales, business"
                                    defaultValue={(form.getValues("tags") ?? []).join(", ")}
                                    onChange={(e) => {
                                        const raw = e.target.value;
                                        const tagsArray = raw
                                            .split(",")
                                            .map((tag) => tag.trim())
                                            .filter(Boolean);

                                        form.setValue("tags", tagsArray, {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        });
                                    }}
                                />
                                <FieldDescription>Separate tags with commas.</FieldDescription>
                                <FieldError errors={[form.formState.errors.tags]} />
                            </Field>
                        </div>
                    </FieldGroup>

                    <hr className="border-border/60" />

                    {/* Subscription Pricing Section */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-base font-semibold">Subscription Pricing</h3>
                            <p className="text-xs text-muted-foreground">Set recurring rates for public tiers.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Field>
                                <FieldLabel>Starter Price ($)</FieldLabel>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    {...form.register("starter_price", { valueAsNumber: true })}
                                />
                                <FieldError errors={[form.formState.errors.starter_price]} />
                            </Field>

                            <Field>
                                <FieldLabel>Pro Price ($)</FieldLabel>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    {...form.register("pro_price", { valueAsNumber: true })}
                                />
                                <FieldError errors={[form.formState.errors.pro_price]} />
                            </Field>

                            <Field>
                                <FieldLabel>Business Price ($)</FieldLabel>
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

                    {/* License Pricing Section */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-base font-semibold">License Pricing</h3>
                            <p className="text-xs text-muted-foreground">Set one-time purchase or special license fees.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel>Reseller Price ($)</FieldLabel>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    {...form.register("reseller_price", { valueAsNumber: true })}
                                />
                                <FieldError errors={[form.formState.errors.reseller_price]} />
                            </Field>

                            <Field>
                                <FieldLabel>Exclusive Price ($)</FieldLabel>
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
                            {isCreating ? "Creating..." : "Create System"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
