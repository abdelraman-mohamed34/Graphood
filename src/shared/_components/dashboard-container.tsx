import React, { ReactNode } from 'react'

type DashboardContainerProps = {
    children: ReactNode,
    className?: string
}

export default function DashboardContainer({
    children,
    className = ""
}: DashboardContainerProps) {
    return (
        <div className={`p-5 ${className}`}>
            {children}
        </div>
    )
}
