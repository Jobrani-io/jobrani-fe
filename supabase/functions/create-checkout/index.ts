import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { StripeClient } from '../_shared/stripe.ts';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

function jsonResponse(status: number, body: unknown) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { ...corsHeaders, 'Content-Type': 'application/json' }
	});
}

interface ReqBody {
	price_id: string;
}

Deno.serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	if (req.method !== 'POST') {
		return new Response('method not allowed', { status: 400 });
	}

	try {
		const supabaseClient = createClient(
			Deno.env.get('SUPABASE_URL') ?? '',
			Deno.env.get('SUPABASE_ANON_KEY') ?? '',
			{
				global: {
					headers: { Authorization: req.headers.get('Authorization')! }
				}
			}
		);

		const {
			data: { user },
			error: authError
		} = await supabaseClient.auth.getUser();
		if (authError || !user) {
			return new Response('unauthorized', { status: 401 });
		}

		const customers = await StripeClient.stripe.customers.list({ email: user.email, limit: 1 });
		const customerId = customers.data?.[0]?.id;

		// create stripe customer and link it to user if it doesn't exist
		if (!customerId) {
			const stripe_customer_id = await StripeClient.createCustomer(user.email!);
			const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

			await supabaseClient
				.from('subscriptions')
				.update({
					stripe_customer_id,
					current_period_start: new Date(),
					current_period_end: weekFromNow
				})
				.eq('user_id', user.id);
		}

		const { data: userSubscription } = await supabaseClient
			.from('subscriptions')
			.select('*')
			.eq('user_id', user.id)
			.single();

		const body: ReqBody = await req.json();
		if (!body.price_id) {
			throw new Error('no price_id found');
		}

		const session = await StripeClient.stripe.checkout.sessions.create({
			customer: userSubscription.stripe_customer_id,
			payment_method_types: ['card'],
			mode: 'subscription',
			line_items: [{ price: body.price_id, quantity: 1 }],
			success_url: `${req.headers.get('origin')}/hub?tab=pay&payment=success`,
			cancel_url: `${req.headers.get('origin')}/hub?tab=pay&payment=cancelled`
		});

		return jsonResponse(200, { sessionId: session.id, url: session.url });
	} catch (error) {
		console.error(error);
		const errorMessage = error instanceof Error ? error.message : String(error);
		return jsonResponse(500, { error: errorMessage });
	}
});
