import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { StripeClient } from '../_shared/stripe.ts';

Deno.serve(async (req) => {
	if (req.method !== 'POST') {
		return new Response('method not allowed', { status: 400 });
	}

	try {
		const payload = await req.json();
		const user = payload.record;
		if (!user) {
			return new Response('no user in body', { status: 400 });
		}

		const supabaseClient = createClient(
			Deno.env.get('SUPABASE_URL') ?? '',
			Deno.env.get('SUPABASE_ANON_KEY') ?? ''
		);

		const stripe_customer_id = await StripeClient.createCustomer(user.email);
		const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

		await supabaseClient.from('subscriptions').insert({
			user_id: user.id,
			plan_type: 'free',
			stripe_customer_id,
			current_period_start: new Date(),
			current_period_end: weekFromNow
		});

		await supabaseClient.from('usage_tracking').insert({
			user_id: user.id,
			week_start: new Date()
		});

		return new Response(JSON.stringify({ ok: true }), { status: 200 });

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		console.error(err);
		return new Response(err.message, { status: 400 });
	}
});
