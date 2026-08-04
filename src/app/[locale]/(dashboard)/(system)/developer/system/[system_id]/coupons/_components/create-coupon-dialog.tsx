"use client";

import { useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import { createCouponSchema, discountTypes } from "@/shared/lib/schemas/coupon/coupon.schema";
import { licenseTypes } from "@/shared/config/licensing";
import { PLAN_LIMITS } from "@/shared/config/plans";

type FormValues = z.infer<typeof createCouponSchema>;

interface CreateCouponDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    systemId: string;
    createCoupon: (values: FormValues) => Promise<{ success: boolean }>;
    isCreating: boolean;
}

const preventInvalidNumberKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["-", "+", "e", "E"].includes(e.key)) {
        e.preventDefault();
    }
};

export function CreateCouponDialog({
    open,
    onOpenChange,
    systemId,
    createCoupon,
    isCreating,
}: CreateCouponDialogProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(createCouponSchema),
        defaultValues: {
            system_id: systemId,
            code: "",
            discount_type: "PERCENT",
            discount_value: 10,
            max_discount: 1,
            license_type: null,
            plan: null,
            min_order_amount: 0,
            max_uses: 1,
            max_uses_per_user: 1,
            one_use_per_system: false,
            starts_at: null,
            expires_at: null,
            is_active: true,
        },
    });

    const discountType = form.watch("discount_type");

    useEffect(() => {
        form.setValue("system_id", systemId);
    }, [systemId, form]);

    useEffect(() => {
        const current = form.getValues("max_discount");

        if (discountType === "PERCENT") {
            if (current == null) {
                form.setValue("max_discount", 1);
            }
        } else {
            if (current != null) {
                form.setValue("max_discount", null);
            }
        }
    }, [discountType, form]);

    const handleOpenChange = (newOpenState: boolean) => {
        if (!newOpenState) {
            form.reset();
        }
        onOpenChange(newOpenState);
    };

    const onSubmit: SubmitHandler<FormValues> = async (values) => {
        try {
            const payload: FormValues = {
                ...values,
                system_id: systemId,
                discount_type: values.discount_type.toUpperCase() as FormValues["discount_type"],
                max_discount:
                    values.discount_type.toUpperCase() === "PERCENT"
                        ? values.max_discount
                        : null,
                license_type: values.license_type || null,
                plan: values.plan || null,
                starts_at: values.starts_at ? new Date(values.starts_at) : null,
                expires_at: values.expires_at ? new Date(values.expires_at) : null,
            };

            await createCoupon(payload);

            form.reset();
            onOpenChange(false);
        } catch (err) {
            console.error("Creation failed:", err);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Coupon</DialogTitle>
                    <DialogDescription>
                        Create a discount coupon for this system.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="code"
                                render={(field) => (
                                    <FormItem>
                                        <FormLabel>Coupon Code</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="SUMMER50"
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(e.target.value.toUpperCase())
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="discount_type"
                                render={(field) => (
                                    <FormItem>
                                        <FormLabel>Discount Type</FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {discountTypes.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="discount_value"
                                render={(field) => (
                                    <FormItem>
                                        <FormLabel>Discount Value</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                onKeyDown={preventInvalidNumberKeys}
                                                {...field}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    field.onChange(val === "" ? "" : Number(val));
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {discountType === "PERCENT" && (
                                <FormField
                                    control={form.control}
                                    name="max_discount"
                                    render={(field) => (
                                        <FormItem>
                                            <FormLabel>Max Discount</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    onKeyDown={preventInvalidNumberKeys}
                                                    value={field.value ?? ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        field.onChange(val === "" ? null : Number(val));
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="license_type"
                                render={(field) => (
                                    <FormItem>
                                        <FormLabel>License</FormLabel>
                                        <Select
                                            value={field.value ?? "ALL"}
                                            onValueChange={(value) =>
                                                field.onChange(value === "ALL" ? null : value)
                                            }
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ALL">All Licenses</SelectItem>
                                                {licenseTypes.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="plan"
                                render={(field) => (
                                    <FormItem>
                                        <FormLabel>Plan</FormLabel>
                                        <Select
                                            value={field.value ?? "ALL"}
                                            onValueChange={(value) =>
                                                field.onChange(value === "ALL" ? null : value)
                                            }
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ALL">All Plans</SelectItem>
                                                {Object.keys(PLAN_LIMITS).map((plan) => (
                                                    <SelectItem key={plan} value={plan}>
                                                        {plan}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="min_order_amount"
                                render={(field) => (
                                    <FormItem>
                                        <FormLabel>Minimum Order Amount</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                onKeyDown={preventInvalidNumberKeys}
                                                {...field}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    field.onChange(val === "" ? 0 : Number(val));
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="max_uses"
                                render={(field) => (
                                    <FormItem>
                                        <FormLabel>Max Uses</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                onKeyDown={preventInvalidNumberKeys}
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    field.onChange(val === "" ? null : Number(val));
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="max_uses_per_user"
                                render={(field) => (
                                    <FormItem>
                                        <FormLabel>Max Uses Per User</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                onKeyDown={preventInvalidNumberKeys}
                                                {...field}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    field.onChange(val === "" ? 1 : Number(val));
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4 rounded-xl border p-4">
                            <FormField
                                control={form.control}
                                name="one_use_per_system"
                                render={(field) => (
                                    <FormItem className="flex items-center justify-between space-y-0">
                                        <div>
                                            <FormLabel>One Use Per System</FormLabel>
                                            <p className="text-xs text-muted-foreground">
                                                Allow this coupon only once for each tenant.
                                            </p>
                                        </div>
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="is_active"
                                render={(field) => (
                                    <FormItem className="flex items-center justify-between space-y-0">
                                        <div>
                                            <FormLabel>Active</FormLabel>
                                            <p className="text-xs text-muted-foreground">
                                                Coupon can be redeemed immediately.
                                            </p>
                                        </div>
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isCreating}
                                onClick={() => handleOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isCreating}>
                                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Coupon
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}