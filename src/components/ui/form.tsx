"use client"

import * as React from "react"
import {
    Controller,
    FormProvider,
    type Control,
    type FieldError,
    type FieldPath,
    type FieldValues,
    type UseFormReturn,
    type ControllerRenderProps,
    type ControllerFieldState,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

type FormProps<T extends FieldValues> = UseFormReturn<T> & {
    children: React.ReactNode
}

const FormFieldContext = React.createContext<{
    error?: FieldError | null
} | null>(null)

export function Form<T extends FieldValues>({
    children,
    ...form
}: FormProps<T>) {
    return <FormProvider {...form}>{children}</FormProvider>
}

export function FormField<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
    control,
    name,
    render,
}: {
    control: Control<TFieldValues>
    name: TName
    render: (props: {
        field: ControllerRenderProps<TFieldValues, TName>
        fieldState: ControllerFieldState
    }) => React.ReactNode
}) {
    return (
        <Controller<TFieldValues, TName>
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <FormFieldContext.Provider value={{ error: fieldState.error }}>
                    {render({ field, fieldState })}
                </FormFieldContext.Provider>
            )}
        />
    )
}

export function FormItem({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("grid gap-2", className)} {...props} />
    )
}

export function FormLabel({
    className,
    ...props
}: React.ComponentProps<typeof Label>) {
    return <Label className={cn("text-sm font-medium", className)} {...props} />
}

export function FormControl({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("flex flex-col gap-2", className)} {...props} />
}

export function FormMessage({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
    const field = React.useContext(FormFieldContext)

    if (!field?.error) {
        return null
    }

    return (
        <p className={cn("text-sm text-destructive", className)} {...props}>
            {children ?? field.error.message}
        </p>
    )
}
