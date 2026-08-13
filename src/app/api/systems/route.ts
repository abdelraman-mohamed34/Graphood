import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createSystemAction } from "@/shared/lib/actions/developer/systems";
import { createSystemSchema } from "@/shared/lib/schemas/systems.schema";

export async function POST(request: Request) {
    try {
        const parsed = createSystemSchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json({ error: "VALIDATION_ERROR", issues: parsed.error.flatten() }, { status: 400 });
        }
        return NextResponse.json(await createSystemAction(parsed.data), { status: 201 });
    } catch (error) {
        if (error instanceof SyntaxError || error instanceof ZodError) {
            return NextResponse.json({ error: "VALIDATION_ERROR", message: "Invalid JSON payload." }, { status: 400 });
        }
        throw error;
    }
}
