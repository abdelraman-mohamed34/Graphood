import { developerJson } from "@/shared/lib/api/developer/response";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export async function GET() {
    const startedAt = Date.now();

    let databaseStatus: "ok" | "error" = "ok";

    try {
        const supabase = await createAdminClient();

        const { error } = await supabase
            .from("systems")
            .select("id")
            .limit(1);

        if (error) {
            databaseStatus = "error";
        }
    } catch {
        databaseStatus = "error";
    }
    const isHealthy = databaseStatus === "ok";

    return developerJson(
        {
            status: isHealthy ? "ok" : "error",
            version: "v1",
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            latency: `${Date.now() - startedAt}ms`,
            checks: {
                api: "ok",
                database: databaseStatus,
            },
        },
        {
            status: isHealthy ? 200 : 503,
        }
    );
}