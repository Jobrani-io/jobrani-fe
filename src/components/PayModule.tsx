import { useState, useMemo, useEffect } from 'react';
import { CheckCircle, Crown, Star, Settings, Target, Brain, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';

const planCardsConfig = [
	{
		plan_type: 'free',
		name: 'Free',
		tagline: '',
		weeklyPrice: '$0',
		monthlyPrice: '$0',
		period: 'forever',
		description: 'Great for testing Jobrani before going all in.',
		features: [
			{ icon: Target, text: 'Up to 100 job searches/week' },
			{ icon: Brain, text: 'Up to 20 hiring managers/week' },
			{ icon: Rocket, text: 'Up to 60 AI messages/week' }
		],
		limits: {
			jobs_searched: 100,
			hiring_managers_found: 20,
			messages_generated: 60,
			outreach_sent: 0
		},
		icon: CheckCircle,
		color: 'border-muted',
		bgColor: 'bg-muted/10'
	},
	{
		plan_type: 'do_it_yourself',
		name: 'Do It Yourself',
		tagline: '',
		weeklyPrice: '$9.99',
		monthlyPrice: '$29.99',
		period: 'week',
		description: 'Tools only — you manage outreach yourself.',
		features: [
			{
				category: 'Prospect & Match',
				icon: Target,
				subFeatures: [
					'Unlimited searches on LinkedIn with our Chrome Extension',
					'Plus 1,000 smart-matched job & hiring-manager searches on our platform each week'
				]
			},
			{
				category: 'Write',
				icon: Brain,
				subFeatures: ['1,000 AI messages/week', 'Up to 3 revisions each']
			},
			{
				category: 'Campaign & Track',
				icon: Rocket,
				subFeatures: ['No automation — manual outreach only']
			}
		],
		limits: {
			jobs_searched: 1000,
			hiring_managers_found: 1000,
			messages_generated: 1000,
			outreach_sent: 0
		},
		icon: Settings,
		color: 'border-blue-200',
		bgColor: 'bg-blue-50/50'
	},
	{
		plan_type: 'do_it_for_me',
		name: 'Do It For Me',
		tagline: '',
		weeklyPrice: '$19.99',
		monthlyPrice: '$59.99',
		period: 'week',
		description: 'Agents automate your outreach.',
		features: [
			'Includes everything in Do It Yourself, PLUS:',
			{
				category: 'Campaign & Track',
				icon: Rocket,
				subFeatures: [
					'120+ automated job applications, emails & LinkedIn connections each week',
					'Weekly performance insights (connections, replies, interviews booked)'
				]
			}
		],
		limits: {
			jobs_searched: 1000,
			hiring_managers_found: 1000,
			messages_generated: 1000,
			outreach_sent: 120
		},
		icon: Star,
		color: 'border-primary',
		bgColor: 'bg-primary/10',
		popular: true
	},
	{
		plan_type: 'do_it_with_me',
		name: 'Do It With Me',
		tagline: '',
		weeklyPrice: '$200',
		monthlyPrice: '$600',
		period: 'week',
		description: 'Agents + personal career coaching.',
		features: [
			'Includes everything in Do It For Me, plus:',
			{
				category: 'Coaching & Support',
				icon: Crown,
				subFeatures: [
					'Weekly 1:1 coaching sessions (resume, interview prep, strategy)',
					'Priority support with faster setup & responses'
				]
			}
		],
		limits: {
			jobs_searched: -1, // unlimited
			hiring_managers_found: -1,
			messages_generated: -1,
			outreach_sent: -1
		},
		icon: Crown,
		color: 'border-secondary',
		bgColor: 'bg-secondary/10'
	}
];

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
let stripe;
loadStripe(STRIPE_PUBLISHABLE_KEY)
	.then((res) => (stripe = res))
	.catch(console.error);

const PayModule = () => {
	const { subscription, usage, loading: subscriptionLoading, plans } = useSubscription();
	const [upgrading, setUpgrading] = useState<string | null>(null);
	const [isMonthly, setIsMonthly] = useState(false);
	const interval = isMonthly ? 'month' : 'week';
	const [searchParams, setSearchParams] = useSearchParams();

	useEffect(() => {
		const paymentSuccess = searchParams.get('payment') === 'success';
		if (paymentSuccess) {
			toast.success('Your plan was successfully updated!');
		}
		searchParams.delete('payment');
		setSearchParams(searchParams);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Auto-setup subscription if missing
	useEffect(() => {
		const autoSetup = async () => {
			if (!subscription && !subscriptionLoading) {
				console.log('No subscription found, auto-setting up free plan...');
				try {
					const { data, error } = await supabase.functions.invoke('check-subscription');
					if (error) throw error;
					console.log('Auto-setup complete:', data);
					toast.success('Free plan activated!');
					// The subscription context will automatically refresh
				} catch (error) {
					console.error('Auto-setup failed:', error);
					toast.error('Failed to setup subscription. Please try refreshing the page.');
				}
			}
		};

		autoSetup();
	}, [subscription, subscriptionLoading]);

	const currentPlan = useMemo(() => {
		const plan = plans.find((p) => subscription?.plan_type === p.plan_type);
		const card = planCardsConfig.find((p) => p.plan_type === plan?.plan_type);
		return { ...card, ...plan, interval: subscription?.billing_cycle };
	}, [plans, subscription]);

	const plansToDisplay = useMemo(() => {
		return planCardsConfig
			.filter((p) => p.plan_type !== 'free')
			.map((card) => {
				const plan = plans.find((p) => p.plan_type === card.plan_type);
				const [weekly, monthly] = ['week', 'month'].map(
					(x) => plan?.prices?.find((p) => p.interval === x)?.amount || 0
				);

				return {
					...card,
					id: plan?.id,
					weeklyPrice: `$${weekly}`,
					monthlyPrice: `$${monthly}`
				};
			});
	}, [plans]);

	const handleUpgrade = async (planId: string) => {
		setUpgrading(planId);

		const plan = plans.find((p) => p.id === planId);
		const price = plan?.prices?.find((p) => p.interval === interval);

		if (!price) {
			throw new Error('Failed to find price');
		}

		try {
			const { data, error } = await supabase.functions.invoke('create-checkout', {
				body: { price_id: price.id }
			});

			if (error) throw error;

			if (data?.sessionId) {
				stripe.redirectToCheckout({ sessionId: data.sessionId });
			}
		} catch (error) {
			console.error('Error creating checkout:', error);
			toast.error('Failed to start checkout process');
		} finally {
			setUpgrading(null);
		}
	};

	const getUsagePercentage = (used: number, limit: number) => {
		if (limit === -1) return 0; // Unlimited
		return Math.min((used / limit) * 100, 100);
	};

	if (subscriptionLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="text-center">
				<h1 className="text-3xl font-bold mb-2">Subscription & Billing</h1>
				<p className="text-muted-foreground">Manage your subscription and track your usage</p>
			</div>

			{/* Current Plan Status */}
			<Card className="bg-gradient-subtle border-primary/20">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Star className="h-5 w-5 text-primary" />
						Current Plan: {currentPlan.name} {currentPlan.tagline}
					</CardTitle>
					<CardDescription>
						You're currently on the {currentPlan.name} plan. {currentPlan.description}
						{subscription?.current_period_end &&
							` Next billing: ${new Date(
								subscription.current_period_end
							).toLocaleDateString()}`}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Jobs Prospected</span>
								<span className="text-sm font-medium">
									{usage.jobs_searched} /{' '}
									{currentPlan.limits.platform_prospect_searches === -1
										? '∞'
										: currentPlan.limits.platform_prospect_searches}
								</span>
							</div>
							<Progress
								value={getUsagePercentage(
									usage.jobs_searched,
									currentPlan.limits.platform_prospect_searches
								)}
								className="h-2"
							/>
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">
									Hiring Managers Matched
								</span>
								<span className="text-sm font-medium">
									{usage.prospects_found || 0} /{' '}
									{currentPlan.limits.matches === -1 ? '∞' : currentPlan.limits.matches}
								</span>
							</div>
							<Progress
								value={getUsagePercentage(
									usage.prospects_found || 0,
									currentPlan.limits.matches
								)}
								className="h-2"
							/>
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">AI Messages Generated</span>
								<span className="text-sm font-medium">
									{usage.messages_generated} /{' '}
									{currentPlan.limits.ai_messages === -1
										? '∞'
										: currentPlan.limits.ai_messages}
								</span>
							</div>
							<Progress
								value={getUsagePercentage(
									usage.messages_generated,
									currentPlan.limits.ai_messages
								)}
								className="h-2"
							/>
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Applications Sent</span>
								<span className="text-sm font-medium">
									{usage.outreach_sent} /{' '}
									{currentPlan.limits.linkedin_outreach === -1
										? '∞'
										: currentPlan.limits.linkedin_outreach || 'N/A'}
								</span>
							</div>
							<Progress
								value={getUsagePercentage(
									usage.outreach_sent,
									currentPlan.limits.linkedin_outreach || 0
								)}
								className="h-2"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Billing Toggle */}
			<div className="flex justify-center items-center gap-4 mb-8">
				<span
					className={`text-sm font-medium ${
						!isMonthly ? 'text-primary' : 'text-muted-foreground'
					}`}>
					Weekly
				</span>
				<Switch checked={isMonthly} onCheckedChange={setIsMonthly} />
				<span
					className={`text-sm font-medium ${
						isMonthly ? 'text-primary' : 'text-muted-foreground'
					}`}>
					Monthly
				</span>
			</div>

			{/* Pricing Plans */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{plansToDisplay.map((plan) => {
					const Icon = plan.icon;
					const isCurrentPlan = currentPlan.plan_type === plan.plan_type;
					// && currentPlan.interval === `${interval}ly`;

					return (
						<Card
							key={plan.plan_type}
							className={`relative transition-all duration-300 hover:shadow-glow ${
								plan.popular ? 'border-primary shadow-card' : plan.color
							} ${isCurrentPlan ? 'ring-2 ring-primary' : ''} ${plan.bgColor}`}>
							{plan.popular && (
								<Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
									Most Popular
								</Badge>
							)}
							{isCurrentPlan && (
								<Badge className="absolute -top-2 right-4 bg-secondary text-secondary-foreground">
									Current Plan
								</Badge>
							)}

							<CardHeader className="text-center">
								<div className="mx-auto mb-4">
									<Icon
										className={`h-10 w-10 ${
											plan.popular ? 'text-primary' : 'text-muted-foreground'
										}`}
									/>
								</div>
								<CardTitle className="text-2xl">
									{plan.tagline && <span className="mr-2">{plan.tagline}</span>}
									{plan.name}
								</CardTitle>
								<div className="space-y-1">
									<div className="text-3xl font-bold">
										{isMonthly ? plan.monthlyPrice : plan.weeklyPrice}
										<span className="text-base font-normal text-muted-foreground">
											/
											{isMonthly
												? 'month'
												: plan.plan_type === 'free'
												? 'forever'
												: 'week'}
										</span>
									</div>
								</div>
								<CardDescription>{plan.description}</CardDescription>
							</CardHeader>

							<CardContent>
								<ul className="space-y-3 mb-6">
									{plan.features.map((feature, index) => (
										<li key={index} className="space-y-2">
											{typeof feature === 'string' ? (
												<span className="text-sm">{feature}</span>
											) : feature.category ? (
												<div className="space-y-2">
													<div className="flex items-center gap-2">
														<feature.icon className="h-4 w-4 text-primary flex-shrink-0" />
														<span className="text-sm font-semibold">
															{feature.category}
														</span>
													</div>
													<ul className="ml-6 space-y-1">
														{feature.subFeatures.map((subFeature, subIndex) => (
															<li key={subIndex} className="flex items-start gap-2">
																<span className="text-xs text-muted-foreground mt-1">
																	•
																</span>
																<span className="text-sm">{subFeature}</span>
															</li>
														))}
													</ul>
												</div>
											) : (
												<>
													<feature.icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
													<span className="text-sm">{feature.text}</span>
												</>
											)}
										</li>
									))}
								</ul>

								{!isCurrentPlan ? (
									<Button
										variant={plan.popular ? 'hero' : 'outline'}
										className="w-full"
										onClick={() => handleUpgrade(plan.id)}
										disabled={upgrading === plan.id}>
										{upgrading === plan.id ? 'Processing...' : 'Upgrade'}
									</Button>
								) : (
									<Button variant="outline" className="w-full" disabled>
										<CheckCircle className="h-4 w-4 mr-2" />
										Current Plan
									</Button>
								)}
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
};

export default PayModule;
