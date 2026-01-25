import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

// Webhook Secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    const signature = req.headers.get("stripe-signature");

    if (!signature || !webhookSecret) {
        return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
    }

    let event;
    const body = await req.text(); // Get raw body for verification

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
    }

    const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as any;
                // Update user to PRO and save Customer ID for future entry lookups
                // (Note: webhook ensures we capture the customer ID even if client-side return fails)
                const userId = session.metadata?.supabaseUserId;
                const subscriptionId = session.subscription;
                const customerId = session.customer;

                if (userId) {
                    await adminSupabase.from('profiles').update({
                        subscription_tier: 'pro',
                        stripe_subscription_id: subscriptionId,
                        stripe_customer_id: customerId,
                        updated_at: new Date().toISOString()
                    }).eq('id', userId);
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as any;
                // Updates status, cancellation status, etc.
                await adminSupabase.from('profiles').update({
                    subscription_tier: subscription.status === 'active' || subscription.status === 'trialing' ? 'pro' : 'free',
                    subscription_status: subscription.status,
                    cancel_at_period_end: subscription.cancel_at_period_end,
                    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                    updated_at: new Date().toISOString()
                }).eq('stripe_customer_id', subscription.customer);
                break;
            }

            case 'invoice.payment_succeeded': {
                // Subscription renewal success
                // Could extend validity if we tracked dates manually.
                // For now, 'pro' status persists until cancellation.
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any;
                const customerId = subscription.customer;

                // Downgrade to FREE
                await adminSupabase.from('profiles').update({
                    subscription_tier: 'free',
                    stripe_subscription_id: null,
                    updated_at: new Date().toISOString()
                }).eq('stripe_customer_id', customerId);
                break;
            }
        }
    } catch (e) {
        console.error("Webhook processing failed", e);
        return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
