import { NextResponse } from "next/server";
import { z } from "zod";
import { updateSystemAction } from "@/shared/lib/actions/developer/systems";
import { systemUpdateSchema } from "@/shared/lib/schemas/systems.schema";

export async function PATCH(request: Request, { params }: { params: Promise<{ systemId: string }> }) {
    try {
        const { systemId } = await params;
        if (!z.string().uuid().safeParse(systemId).success) {
            return NextResponse.json({ error: "VALIDATION_ERROR", message: "Invalid system ID." }, { status: 400 });
        }
        const parsed = systemUpdateSchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json({ error: "VALIDATION_ERROR", issues: parsed.error.flatten() }, { status: 400 });
        }
        return NextResponse.json(await updateSystemAction(systemId, parsed.data));
    } catch (error) {
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: "VALIDATION_ERROR", message: "Invalid JSON payload." }, { status: 400 });
        }
        throw error;
    }
}
