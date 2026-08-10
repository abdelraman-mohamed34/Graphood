import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


export function TableSkeleton() {
    return (
        <div className="border rounded-lg bg-card shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-right"><Skeleton className="h-4 w-32" /></TableHead>
                        <TableHead className="text-right"><Skeleton className="h-4 w-20" /></TableHead>
                        <TableHead className="text-right"><Skeleton className="h-4 w-24" /></TableHead>
                        <TableHead className="text-center"><Skeleton className="h-4 w-16 mx-auto" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 4 }).map((_, index) => (
                        <TableRow key={index}>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                            <TableCell className="text-center"><Skeleton className="h-8 w-8 rounded-md mx-auto" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
