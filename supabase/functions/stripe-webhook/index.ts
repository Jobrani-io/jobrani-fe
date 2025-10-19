import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { StripeClient } from '../_shared/stripe.ts';

Deno.serve(async (req) => {
	if (req.method !== 'POST') {
		return new Response('method not allowed', { status: 400 });
	}

	const signature = req.headers.get('Stripe-Signature');

	try {
		const body = await req.text();
		const event = await StripeClient.stripe.webhooks.constructEventAsync(
			body,
			signature!,
			Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!,
			undefined,
			StripeClient.cryptoProvider
		);

		const supabaseClient = createClient(
			Deno.env.get('SUPABASE_URL') ?? '',
			Deno.env.get('SUPABASE_ANON_KEY') ?? ''
		);

		const data = event.data.object;
		const customerId = data?.customer;

		const { data: userSubscription } = await supabaseClient
			.from('subscriptions')
			.select('*')
			.eq('stripe_customer_id', customerId)
			.single();

		if (!userSubscription) {
			return new Response('user not found', { status: 400 });
		}

		if (event.type === 'invoice.paid') {
			const productId = data?.lines?.data?.[0]?.pricing?.price_details?.product;
			const product = await StripeClient.getProduct(productId);
			const subscriptionId = data?.parent?.subscription_details?.subscription;
			const subscription = await StripeClient.getSubscription(subscriptionId);
			const [current_period_start, current_period_end] = [
				'current_period_start',
				'current_period_end'
			].map((key) => new Date((subscription?.items?.data?.[0]?.[key] || 0) * 1000));
			const billing_cycle = subscription?.items?.data?.[0]?.price?.recurring?.interval;

			await supabaseClient
				.from('subscriptions')
				.update({
					plan_type: product?.metadata?.plan_type,
					stripe_subscription_id: subscriptionId,
					current_period_start,
					current_period_end,
					billing_cycle: `${billing_cycle}ly`
				})
				.eq('user_id', userSubscription.user_id);
		} else if (event.type === 'invoice.payment_failed') {
			// downgrade to free
			await supabaseClient
				.from('subscriptions')
				.update({ plan_type: 'free', status: 'unpaid' })
				.eq('user_id', userSubscription.user_id);
		} else if (event.type === 'customer.subscription.deleted') {
			// user cancels
			await supabaseClient
				.from('subscriptions')
				.update({
					plan_type: 'free',
					stripe_subscription_id: null
				})
				.eq('user_id', userSubscription.user_id);
		} else if (event.type === 'customer.subscription.updated') {
			// user changes plan
			const subscriptionId = data?.id;
			const productId = data?.items?.data?.[0]?.price?.product;
			const product = await StripeClient.getProduct(productId);
			const subscription = await StripeClient.getSubscription(subscriptionId);
			const [current_period_start, current_period_end] = [
				'current_period_start',
				'current_period_end'
			].map((key) => new Date((subscription?.items?.data?.[0]?.[key] || 0) * 1000));
			const billing_cycle = subscription?.items?.data?.[0]?.price?.recurring?.interval;

			await supabaseClient
				.from('subscriptions')
				.update({
					plan_type: product?.metadata?.plan_type,
					stripe_subscription_id: subscriptionId,
					current_period_start,
					current_period_end,
					billing_cycle: `${billing_cycle}ly`
				})
				.eq('user_id', userSubscription.user_id);
		}

		return new Response(JSON.stringify({ ok: true }), { status: 200 });

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		console.error(err);
		return new Response(err.message, { status: 400 });
	}
});
