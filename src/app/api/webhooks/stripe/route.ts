// src/app/api/webhooks/stripe/route.ts

export async function POST(req: Request) {
    await req.text();
    return Response.json({
        received: false,
        error: "Stripe webhook processing is not configured.",
    }, { status: 503 });
}
