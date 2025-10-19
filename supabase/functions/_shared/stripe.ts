import Stripe from 'https://esm.sh/stripe@14?target=denonext';

/* eslint-disable @typescript-eslint/no-explicit-any */
export class StripeClient {
	static stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
	static cryptoProvider = Stripe.createSubtleCryptoProvider();

	static async createCustomer(email: string) {
		const customer = await this.stripe.customers.create({ email });
		return customer?.id;
	}

	static async listInvoices(customerId: string) {
		const invoices = await this.stripe.invoices.list({ customer: customerId, limit: 25 });
		return invoices.data.map((i: any) => ({
			id: i.id,
			plan: i?.lines?.data?.[0]?.pricing?.price_details?.product,
			createdAt: i.created,
			total: i.total,
			status: i.status,
			pdf: i.invoice_pdf
		}));
	}

	static async listPlans() {
		console.time('listPlans');

		const products = await this.stripe.products.list({ limit: 10, active: true });
		const allPrices = await this.stripe.prices.list({ limit: 20, active: true });

		console.timeEnd('listPlans');

		return products.data.map((prod: any) => {
			const prices = allPrices.data
				.filter((price: any) => price.product === prod.id)
				.map((price: any) => ({
					id: price.id,
					amount: price.unit_amount / 100,
					interval: price.recurring.interval
				}));

			const { metadata } = prod;

			const limitKeys = [
				'platform_prospect_searches',
				'matches',
				'ai_messages',
				'ai_message_revisions',
				'linkedin_outreach',
				'email_outreach'
			];

			const limits = Object.fromEntries(limitKeys.map((k) => [k, parseInt(metadata[k])]));

			return {
				id: prod.id,
				name: prod.name,
				plan_type: metadata.plan_type,
				limits,
				prices
			};
		});
	}

	static getProduct(id: string) {
		return this.stripe.products.retrieve(id);
	}

	static getSubscription(id: string) {
		return this.stripe.subscriptions.retrieve(id);
	}

	static async cancelSubscription(id: string) {
		const subscription = await this.stripe.subscriptions.cancel(id);
		return subscription;
	}
}
