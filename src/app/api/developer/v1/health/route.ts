import { NextResponse } from "next/server";
import { developerSuccess } from "@/shared/lib/api/developer/response";

export async function GET() {
    return NextResponse.json(
        developerSuccess({
            status: "ok",
        })
    );
}