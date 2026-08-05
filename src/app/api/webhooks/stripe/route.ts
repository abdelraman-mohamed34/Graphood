// src/app/api/webhooks/stripe/route.ts

export async function POST(req: Request) {
    await req.text();


    return Response.json({
        received: true,
    });
}
