import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { StripeClient } from '../_shared/stripe.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

function jsonResponse(status: number, body: unknown) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { ...corsHeaders, 'Content-Type': 'application/json' }
	});
}

const supabase = createClient(
	Deno.env.get('SUPABASE_URL') ?? '',
	Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

const PLANS_CACHE_KEY = 'stripe_plans';

Deno.serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	if (req.method !== 'GET') {
		return jsonResponse(400, { message: 'method not allowed' });
	}

	try {
		const { data } = await supabase
			.from('json_cache')
			.select('*')
			.eq('key', PLANS_CACHE_KEY)
			.single();

		if (!data || (data && new Date(data.expires_at) < new Date())) {
			const plans = await StripeClient.listPlans();

			const twelveHoursLater = Date.now() + 12 * 60 * 60 * 1000;
			const { data, error } = await supabase
				.from('json_cache')
				.upsert({
					key: PLANS_CACHE_KEY,
					value: { plans },
					expires_at: new Date(twelveHoursLater)
				})
				.select()
				.single();

			if (error) throw error;
			return jsonResponse(200, data?.value);
		}

		console.log('returning cached');
		return jsonResponse(200, data?.value);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		console.error(err);
		return jsonResponse(400, { error: err.message });
	}
});
