export default function SystemDetailsLoading() {
    return (
        <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12" aria-busy="true" aria-label="Loading system details">
            <div className="overflow-hidden rounded-none border border-border bg-background">
                <div className="aspect-[21/8] min-h-48 border-b border-border bg-muted" />
                <div className="flex items-center gap-5 p-6 sm:p-8">
                    <div className="size-20 shrink-0 border border-border bg-muted sm:size-24" />
                    <div className="min-w-0 flex-1 space-y-3">
                        <div className="h-8 w-64 max-w-full bg-muted" />
                        <div className="h-4 w-40 max-w-full bg-muted" />
                    </div>
                </div>
            </div>
        </main>
    );
}
