import React, { ReactNode } from 'react'

type DashboardContainerProps = {
    children: ReactNode,
    className?: string
}

export default function DeveloperDashboardContainer({
    children,
    className = ""
}: DashboardContainerProps) {
    return (
        <div className={`max-w-5xl mx-auto space-y-6 p-8 ${className}`}>
            {children}
        </div>
    )
}