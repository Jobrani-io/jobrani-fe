import type { User } from '@supabase/supabase-js';

export type UsageFeature =
	| 'jobs_searched'
	| 'prospects_found'
	| 'messages_generated'
	| 'outreach_sent';

export async function logUsage(
	user: User,
	feature: UsageFeature,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	supabase: any,
	increment: number = 1
) {
	try {
		const { data: usageData, error: usageError } = await supabase
			.from('usage_tracking')
			.select('*')
			.eq('user_id', user.id)
			.order('week_start', { ascending: false })
			.limit(1)
			.maybeSingle();

		if (usageError) throw usageError;

		if (!usageData) {
			console.error('No usage data found for user:', user.id);
			return;
		}

		const currentValue = usageData[feature] || 0;
		const { error } = await supabase
			.from('usage_tracking')
			.update({
				[feature]: currentValue + Math.abs(increment)
			})
			.eq('id', usageData.id);

		if (error) throw error;
	} catch (error) {
		console.error('Failed to log usage', error);
	}
}
