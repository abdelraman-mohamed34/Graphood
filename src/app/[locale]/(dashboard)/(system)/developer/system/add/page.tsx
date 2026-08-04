import CreateSystemForm from "./_components/create-system-form";

export default function Page() {
    return (
        <div className="container mx-auto max-w-3xl py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">
                    Create New System
                </h1>

                <p className="mt-2 text-muted-foreground">
                    Create a new system to publish it on Graphood and generate
                    API keys for integration.
                </p>
            </div>

            <CreateSystemForm />
        </div>
    );
}