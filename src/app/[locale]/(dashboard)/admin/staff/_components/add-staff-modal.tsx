"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, ShieldAlert, ShieldCheck, UserPlus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { usePlatformStaff } from "@/shared/lib/hooks/admins/use-platform-staff";
import {
    createPlatformStaffSchema,
    type CreatePlatformStaffInput,
    type SystemRole,
} from "@/shared/lib/schemas/graphood-staff.schema";

interface AddStaffModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddStaffModal({ isOpen, onClose }: AddStaffModalProps) {
    const t = useTranslations("AdminStaff");
    const { addStaff, isAddingStaff } = usePlatformStaff();
    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<CreatePlatformStaffInput>({
        resolver: zodResolver(createPlatformStaffSchema),
        defaultValues: { email: "", role: "SUPPORT_AGENT" },
    });

    const close = () => {
        if (isAddingStaff) return;
        reset();
        onClose();
    };

    const submit = handleSubmit(async (input) => {
        try {
            await addStaff(input);
            reset();
            onClose();
        } catch {
            // The mutation displays the localized error toast and keeps the form open.
        }
    });

    const validationMessage = (message?: string) =>
        message && t.has(message) ? t(message) : t("validation.invalidInput");

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
            <DialogContent showCloseButton={false} className="sm:max-w-[480px]">
                <DialogHeader className="text-start">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-2 text-primary">
                            <span className="shrink-0 rounded-lg bg-primary/10 p-2">
                                <UserPlus className="size-5" />
                            </span>
                            <DialogTitle className="text-xl font-bold">
                                {t("add.title")}
                            </DialogTitle>
                        </div>
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                disabled={isAddingStaff}
                                aria-label={t("actions.close")}
                                className="shrink-0"
                            >
                                <X className="size-4" />
                            </Button>
                        </DialogClose>
                    </div>
                    <DialogDescription className="text-start">
                        {t("add.description")}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-5 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="staff-email" className="block text-start">
                            {t("fields.email")}
                        </Label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="staff-email"
                                type="email"
                                autoComplete="email"
                                dir="ltr"
                                placeholder={t("add.emailPlaceholder")}
                                className="ps-9 text-start"
                                aria-invalid={Boolean(errors.email)}
                                {...register("email")}
                            />
                        </div>
                        {errors.email ? (
                            <p className="text-start text-xs text-destructive" role="alert">
                                {validationMessage(errors.email.message)}
                            </p>
                        ) : (
                            <p className="text-start text-xs text-muted-foreground">
                                {t("add.emailHint")}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="block text-start">{t("fields.role")}</Label>
                        <Select
                            defaultValue="SUPPORT_AGENT"
                            onValueChange={(value: SystemRole) =>
                                setValue("role", value, { shouldDirty: true, shouldValidate: true })
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t("add.rolePlaceholder")} />
                            </SelectTrigger>
                            <SelectContent position="popper" sideOffset={4} className="z-[100]">
                                <SelectItem value="SUPPORT_AGENT">
                                    <span className="flex items-center gap-2">
                                        <ShieldCheck className="size-4 text-blue-600" />
                                        {t("roles.SUPPORT_AGENT")}
                                    </span>
                                </SelectItem>
                                <SelectItem value="SUPER_ADMIN">
                                    <span className="flex items-center gap-2">
                                        <ShieldAlert className="size-4 text-red-600" />
                                        {t("roles.SUPER_ADMIN")}
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="gap-2 sm:space-x-reverse">
                        <Button type="button" variant="outline" onClick={close} disabled={isAddingStaff}>
                            {t("actions.cancel")}
                        </Button>
                        <Button type="submit" disabled={isAddingStaff}>
                            {isAddingStaff && <Loader2 className="size-4 animate-spin" />}
                            {isAddingStaff ? t("add.submitting") : t("add.submit")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
