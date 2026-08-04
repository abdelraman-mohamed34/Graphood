'use client'

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Control, FieldPath, FieldValues, useController } from 'react-hook-form'

type RoleSelectProps<T extends FieldValues> = {
    control?: Control<T>
    name?: FieldPath<T>
    value?: string | null
    onValueChange?: (value: string) => void
    disabled?: boolean
}

export function RoleSelect<T extends FieldValues>({
    control,
    name,
    value: valueProp,
    onValueChange: onValueChangeProp,
    disabled,
}: RoleSelectProps<T>) {
    if (control && name) {
        return <ControlledRoleSelect control={control} name={name} disabled={disabled} />
    }

    return <RoleSelectView value={valueProp} onValueChange={onValueChangeProp} disabled={disabled} />
}

function ControlledRoleSelect<T extends FieldValues>({ control, name, disabled }:
    Required<Pick<RoleSelectProps<T>, "control" | "name">> & Pick<RoleSelectProps<T>, "disabled">) {
    const { field } = useController({ control, name })

    return <RoleSelectView
        value={typeof field.value === "string" ? field.value : null}
        onValueChange={field.onChange}
        disabled={disabled}
    />
}

function RoleSelectView({ value, onValueChange, disabled }: {
    value?: string | null
    onValueChange?: (value: string) => void
    disabled?: boolean
}) {

    const membershipRoles = ["ADMIN"]

    return (
        <Select
            value={value ?? undefined}
            onValueChange={onValueChange}
            disabled={disabled}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
            </SelectTrigger>

            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Roles</SelectLabel>

                    {membershipRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                            {role.toUpperCase()}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
