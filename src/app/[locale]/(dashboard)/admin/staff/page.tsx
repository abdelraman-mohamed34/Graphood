import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { StaffHeader } from "./_components/staff-header";
import { StaffTable } from "./_components/staff-table";
import { TableSkeleton } from "./_components/table-skeleton";

export async function generateMetadata() {
    const t = await getTranslations("AdminStaff");
    return { title: t("metadataTitle") };
}

export default function StaffPage() {
    return (
        <div className="space-y-6">
            <StaffHeader />
            <Suspense fallback={<TableSkeleton />}>
                <StaffTable />
            </Suspense>
        </div>
    );
}
