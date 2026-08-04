import { developerJson } from "@/shared/lib/api/developer/response";

export async function GET() {
    return developerJson({
        name: "Graphood Developer API",
        version: "v1",
        status: "ok",
        message:
            "Welcome to the Graphood Developer API.",

        links: {
            documentation: "/developer/docs",
            health: "/api/developer/v1/health",
        },
    });
}