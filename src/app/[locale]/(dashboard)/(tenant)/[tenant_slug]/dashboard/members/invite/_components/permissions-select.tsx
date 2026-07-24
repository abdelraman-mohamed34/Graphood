'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { permissions } from '@/shared/lib/schemas/public/permissions'
import { Permission } from '@/shared/lib/schemas/public/permissions'

type Props = {
    value: Permission[]
    onChange: (value: Permission[]) => void
}

export default function PermissionsSelect({
    value,
    onChange,
}: Props) {
    return (
        <div className="space-y-3">
            {permissions.map((permission) => (
                <label
                    key={permission}
                    className="flex items-center gap-3"
                >
                    <Checkbox
                        checked={value.includes(permission)}
                        onCheckedChange={(checked) => {
                            if (checked) {
                                onChange([...value, permission])
                            } else {
                                onChange(value.filter((p) => p !== permission))
                            }
                        }}
                    />

                    <span>{permission}</span>
                </label>
            ))}
        </div>
    )
}