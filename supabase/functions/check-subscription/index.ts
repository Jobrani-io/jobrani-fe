import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Use service role key for writing to database
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Use anon key client for user authentication
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check for existing customer in Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating to free plan");
      
      // Update to free plan if no customer exists
      const { error: updateError } = await supabaseClient
        .from("subscriptions")
        .upsert({
          user_id: user.id,
          plan_type: 'free',
          status: 'active',
          billing_cycle: 'weekly',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          stripe_customer_id: null,
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        }, { 
          onConflict: 'user_id'
        });

      if (updateError) throw updateError;

      // Ensure usage tracking record exists for free plan users
      const { data: existingUsage } = await supabaseClient
        .from("usage_tracking")
        .select("id")
        .eq("user_id", user.id)
        .order("week_start", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!existingUsage) {
        logStep("Creating usage tracking record for free plan");
        const { error: usageError } = await supabaseClient
          .from("usage_tracking")
          .insert({
            user_id: user.id,
            week_start: new Date().toISOString(),
            jobs_searched: 0,
            prospects_found: 0,
            messages_generated: 0,
            outreach_sent: 0
          });

        if (usageError) {
          logStep("Warning: Failed to create usage tracking", { error: usageError.message });
        }
      }

      return new Response(JSON.stringify({
        subscribed: false,
        plan_type: 'free',
        status: 'active',
        current_period_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let planType = 'free';
    let billingCycle = 'weekly';
    let subscriptionEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    let stripeSubscriptionId = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      stripeSubscriptionId = subscription.id;
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      
      // Determine plan type from price
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      billingCycle = price.recurring?.interval === 'month' ? 'monthly' : 'weekly';
      
      if (amount <= 2500) {
        planType = "pro";
      } else if (amount <= 25000) {
        planType = "premium";
      } else {
        planType = "enterprise";
      }
      logStep("Determined plan details", { priceId, amount, planType, billingCycle });
    } else {
      logStep("No active subscription found");
    }

    // Update subscription in Supabase
    const { error: updateError } = await supabaseClient
      .from("subscriptions")
      .upsert({
        user_id: user.id,
        plan_type: planType,
        status: hasActiveSub ? 'active' : 'inactive',
        billing_cycle: billingCycle,
        current_period_start: hasActiveSub ? new Date(subscriptions.data[0].current_period_start * 1000).toISOString() : new Date().toISOString(),
        current_period_end: subscriptionEnd,
        stripe_customer_id: customerId,
        stripe_subscription_id: stripeSubscriptionId,
        updated_at: new Date().toISOString(),
      }, { 
        onConflict: 'user_id'
      });

    if (updateError) throw updateError;

    // Ensure usage tracking record exists
    const { data: existingUsage } = await supabaseClient
      .from("usage_tracking")
      .select("id")
      .eq("user_id", user.id)
      .order("week_start", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!existingUsage) {
      logStep("Creating usage tracking record");
      const { error: usageError } = await supabaseClient
        .from("usage_tracking")
        .insert({
          user_id: user.id,
          week_start: new Date().toISOString(),
          jobs_searched: 0,
          prospects_found: 0,
          messages_generated: 0,
          outreach_sent: 0
        });

      if (usageError) {
        logStep("Warning: Failed to create usage tracking", { error: usageError.message });
        // Don't throw - subscription setup is more important
      }
    }

    logStep("Updated database with subscription info", { subscribed: hasActiveSub, planType });
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      plan_type: planType,
      status: hasActiveSub ? 'active' : 'inactive',
      billing_cycle: billingCycle,
      current_period_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});