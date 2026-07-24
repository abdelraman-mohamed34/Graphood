// src/app/api/webhooks/stripe/route.ts

export async function POST(req: Request) {
    const body = await req.text();

    console.log("Stripe Webhook Body:", body);

    return Response.json({
        received: true,
    });
}