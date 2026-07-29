"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SubmitHandler } from "react-hook-form";

import {
    systemInsertSchema,
    type SystemInsert,
} from "@/shared/lib/schemas/systems.schema";

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
import z from "zod";
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
            currency: "EGP",
            is_public: true,
            status: "PENDING",
        },
    });

    const onSubmit: SubmitHandler<CreateSystemInput> = async (values) => {
        try {
            const system = await createSystem(values);

            toast.success("System created successfully.");

            if (system?.id) {
                router.push(`/developer/${system.id}/api-keys`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to create system.");
        }
    };

    return (
        <Card className="mx-auto max-w-3xl">
            <CardHeader>
                <CardTitle>Create New System</CardTitle>

                <CardDescription>
                    Create your system to start integrating with Graphood.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <FieldGroup>
                        <Field>
                            <FieldLabel>System Name</FieldLabel>

                            <Input
                                placeholder="My Awesome CRM"
                                {...form.register("name")}
                            />

                            <FieldError
                                errors={[form.formState.errors.name]}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Slug</FieldLabel>

                            <Input
                                placeholder="awesome-crm"
                                {...form.register("slug")}
                            />

                            <FieldDescription>
                                Used in URLs.
                            </FieldDescription>

                            <FieldError
                                errors={[form.formState.errors.slug]}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Description</FieldLabel>

                            <Textarea
                                rows={5}
                                placeholder="Describe your system..."
                                {...form.register("description")}
                            />

                            <FieldError
                                errors={[form.formState.errors.description]}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Category</FieldLabel>

                            <Input
                                placeholder="CRM"
                                {...form.register("category")}
                            />

                            <FieldError
                                errors={[form.formState.errors.category]}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Tags</FieldLabel>

                            <Input
                                placeholder="crm, sales, business"
                                value={(form.watch("tags") ?? []).join(", ")}
                                onChange={(e) =>
                                    form.setValue(
                                        "tags",
                                        e.target.value
                                            .split(",")
                                            .map((tag) => tag.trim())
                                            .filter(Boolean),
                                        {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        }
                                    )
                                }
                            />

                            <FieldDescription>
                                Separate tags with commas.
                            </FieldDescription>

                            <FieldError
                                errors={[form.formState.errors.tags]}
                            />
                        </Field>
                    </FieldGroup>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={isCreating}
                        >
                            {isCreating
                                ? "Creating..."
                                : "Create System"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}