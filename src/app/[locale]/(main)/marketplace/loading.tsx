export default function MarketplaceLoading() {
    return (
        <main className="min-h-screen bg-background" aria-busy="true" aria-label="Loading marketplace">
            <div className="h-52 border-b border-border bg-muted sm:h-64" />
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto mb-10 h-10 w-72 max-w-full bg-muted" />
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }, (_, index) => (
                        <div key={index} className="aspect-[16/9] rounded-none border border-border bg-muted" />
                    ))}
                </div>
            </div>
        </main>
    );
}
