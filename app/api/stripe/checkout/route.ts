import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

// export const runtime = 'edge'; // Switch to Node.js runtime for better Stripe SDK compatibility

export async function POST(req: NextRequest) {
    try {
        // ... (rest of the function remains the same until session creation)

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            allow_promotion_codes: true,
            automatic_payment_methods: {
                enabled: true,
            },
            success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: returnUrl,
            metadata: {
                supabaseUserId: user.id
            },
            subscription_data: {
                metadata: {
                    supabaseUserId: user.id
                }
            }
        }); // Removed manual override, let it use default

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
