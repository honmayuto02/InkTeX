import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

// export const runtime = 'edge'; // Switch to Node.js runtime for better Stripe SDK compatibility

export async function POST(req: NextRequest) {
    try {
        // Auth Check
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];

        // Init Supabase (Service Role to update customer ID if needed, or just Auth validation)
        // We need USER ID.
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { priceId, returnUrl } = body;

        // Get or Create Stripe Customer
        // Ideally we store stripe_customer_id in profiles.
        // For now, let's fetch profile.

        // Note: We need Admin Client to read secure fields or update them?
        // Or users can read own profile.

        // Let's use Service Role for DB operations to be safe.
        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: profile } = await adminSupabase
            .from('profiles')
            .select('stripe_customer_id, email')
            .eq('id', user.id)
            .single();

        let customerId = profile?.stripe_customer_id;

        if (!customerId) {
            // Create new customer
            const customer = await stripe.customers.create({
                email: user.email || profile?.email,
                metadata: {
                    supabaseUserId: user.id
                }
            });
            customerId = customer.id;

            // Save to DB
            await adminSupabase
                .from('profiles')
                .update({ stripe_customer_id: customerId })
                .eq('id', user.id);
        }

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
        });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
