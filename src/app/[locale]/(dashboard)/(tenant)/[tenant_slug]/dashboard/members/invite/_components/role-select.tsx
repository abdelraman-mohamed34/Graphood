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
    let value: string | null | undefined = valueProp
    let onValueChange: ((v: string) => void) | undefined = onValueChangeProp

    if (control && name) {
        const {
            field: { value: v, onChange },
        } = useController({
            control,
            name,
        })
        value = v as any
        onValueChange = onChange as any
    }

    const membershipRoles = ["ADMIN", "OWNER"]

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