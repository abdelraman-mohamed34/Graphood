import dotenv from "dotenv";

dotenv.config({
    path: ".env.local",
});

import { createApiKey } from "@/shared/lib/supabase/services/developer/api-keys";

async function main() {
    const result = await createApiKey({
        system_id: "2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d",
        name: "Development",
        is_active: true,
        expires_at: null,
    });

    console.log("API KEY:", result.apiKey);
    console.log("RECORD:", result.record);
}

main();