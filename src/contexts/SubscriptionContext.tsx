import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { LimitReachedModal } from '@/components/LimitReachedModal';

export interface SubscriptionData {
	id: string;
	plan_type: string;
	status: string;
	billing_cycle: string;
	current_period_start: string;
	current_period_end: string;
	stripe_customer_id?: string;
	stripe_subscription_id?: string;
}

export interface UsageData {
	id: string;
	user_id: string;
	week_start: string;
	messages_generated: number;
	outreach_sent: number;
	prospects_found: number;
	jobs_searched: number;
}

export type UsageFeature =
	| 'jobs_searched'
	| 'prospects_found'
	| 'messages_generated'
	| 'outreach_sent';

export type UsageLimits =
	| 'platform_prospect_searches'
	| 'matches'
	| 'ai_messages'
	| 'email_outreach';

const featureToLimit: Record<UsageFeature, UsageLimits> = {
	jobs_searched: 'platform_prospect_searches',
	prospects_found: 'matches',
	messages_generated: 'ai_messages',
	outreach_sent: 'email_outreach'
};

export interface Price {
	id: string;
	amount: number;
	interval: 'week' | 'month';
}

export interface Limits {
	platform_prospect_searches: number;
	matches: number;
	ai_messages: number;
	ai_message_revisions: number;
	linkedin_outreach: number;
	email_outreach: number;
}

export interface Plan {
	id: string;
	name: string;
	plan_type: string;
	limits: Limits;
	prices: Price[];
}

export interface CurrentPlan {
	id: string;
	name: string;
	plan_type: string;
	limits: Limits;
	interval: 'week' | 'month';
	amount: number;
	prices: Price[];
}

interface SubscriptionContextType {
	subscription: SubscriptionData | null;
	usage: UsageData | null;
	loading: boolean;
	error: string | null;
	plans: Plan[];
	currentPlan: CurrentPlan | null;
	refreshSubscription: () => Promise<unknown>;
	openCustomerPortal: () => Promise<void>;
	refetch: () => Promise<unknown>;
	isLimitReached: (feature: UsageFeature) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
	const context = useContext(SubscriptionContext);
	if (context === undefined) {
		throw new Error('useSubscription must be used within a SubscriptionProvider');
	}
	return context;
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { user } = useAuth();
	const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
	const [usage, setUsage] = useState<UsageData | null>(null);
	const [subscriptionLoading, setSubscriptionLoading] = useState(true);
	const [usageDataLoading, setUsageDataLoading] = useState(true);
	const [plansLoading, setPlansLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [plans, setPlans] = useState<Plan[]>([]);
	const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null);
	const [limitReachedFeature, setLimitReachedFeature] = useState<UsageFeature | null>(null);

	const fetchSubscription = async () => {
		if (!user) return;

		try {
			setSubscriptionLoading(true);
			setError(null);

			// Fetch subscription data
			const { data: subscriptionData, error: subscriptionError } = await supabase
				.from('subscriptions')
				.select('*')
				.eq('user_id', user.id)
				.single();

			if (subscriptionError && subscriptionError.code !== 'PGRST116') {
				throw subscriptionError;
			}

			const plan = plans.find((p) => subscriptionData?.plan_type === p.plan_type);
			const price = plan?.prices?.find(
				(p) => subscriptionData?.billing_cycle === `${p.interval}ly`
			);
			const currentPlan = price ? { ...price, ...plan } : null;

			setCurrentPlan(currentPlan);
			setSubscription(subscriptionData);
		} catch (err) {
			console.error('Error fetching subscription:', err);
			setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
		} finally {
			setSubscriptionLoading(false);
		}
	};

	const fetchUsageData = async () => {
		if (!user) return;

		try {
			setUsageDataLoading(true);
			const { data: usageData, error: usageError } = await supabase
				.from('usage_tracking')
				.select('*')
				.eq('user_id', user.id)
				.order('week_start', { ascending: false })
				.limit(1)
				.maybeSingle();

			if (usageError) {
				throw usageError;
			}

			setUsage(usageData);
		} catch (error) {
			console.error('Failed to fetch usage data', error);
		} finally {
			setUsageDataLoading(false);
		}
	};

	const fetchPlans = async () => {
		try {
			setPlansLoading(true);
			const { data } = await supabase.functions.invoke('subscription-plans', {
				method: 'GET'
			});
			const plans = data?.plans || [];
			setPlans(plans);
		} catch (error) {
			console.error('Failed to fetch plans', error);
		} finally {
			setPlansLoading(false);
		}
	};

	const refreshSubscription = async () => {
		if (!user) return;

		try {
			const { data, error } = await supabase.functions.invoke('check-subscription');
			if (error) throw error;

			// Refetch data after checking with Stripe
			await fetchSubscription();
			return data;
		} catch (err) {
			console.error('Error refreshing subscription:', err);
			setError(err instanceof Error ? err.message : 'Failed to refresh subscription');
			throw err;
		}
	};

	const isLimitReached = (feature: UsageFeature) => {
		const limitKey = featureToLimit[feature];
		const limit = currentPlan?.limits?.[limitKey];
		const limitReached = limit === 0 || (limit ? limit !== -1 && usage[feature] >= limit : false);
		// Show limit reached modal
		if (limitReached) setLimitReachedFeature(feature);
		fetchUsageData();
		return limitReached;
	};

	const openCustomerPortal = async () => {
		try {
			const { data, error } = await supabase.functions.invoke('customer-portal');
			if (error) throw error;

			if (data?.url) {
				window.open(data.url, '_blank');
			}
		} catch (err) {
			console.error('Error opening customer portal:', err);
			setError(err instanceof Error ? err.message : 'Failed to open customer portal');
			throw err;
		}
	};

	useEffect(() => {
		fetchPlans();
	}, []);

	useEffect(() => {
		fetchSubscription();
		fetchUsageData();
	}, [user, plans]);

	const loading = plansLoading || subscriptionLoading || usageDataLoading;

	const value = {
		subscription,
		usage,
		loading,
		error,
		plans,
		currentPlan,
		refreshSubscription,
		openCustomerPortal,
		refetch: fetchSubscription,

		isLimitReached
	};

	return (
		<SubscriptionContext.Provider value={value}>
			{children}
			<LimitReachedModal
				feature={limitReachedFeature}
				onClose={() => setLimitReachedFeature(null)}
			/>
		</SubscriptionContext.Provider>
	);
};
