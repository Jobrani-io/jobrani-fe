import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
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

Deno.serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	if (req.method !== 'GET') {
		return new Response('method not allowed', { status: 400 });
	}

	try {
		const supabase = createClient(
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
		} = await supabase.auth.getUser();
		if (authError || !user) {
			return jsonResponse(401, { error: 'Unauthorized' });
		}

		const selects = (
			[
				'saved_prospects',
				'generated_messages',
				'preferred_matches',
				'launched_applications'
			] as const
		).map((table) => {
			const query = supabase.from(table).select().eq('user_id', user.id);
			if (table === 'saved_prospects') {
				return query.order('saved_date', { ascending: false });
			}
			return query;
		});

		const [
			{ data: prospects },
			{ data: generatedMessages },
			{ data: matches },
			{ data: launchedApps }
		] = await Promise.all(selects);

		const { data: resumes } = await supabase
			.from('user_resumes')
			.select()
			.eq('user_id', user.id)
			.order('created_at', { ascending: false });

		const { data: profile } = await supabase
			.from('profiles')
			.select()
			.eq('user_id', user.id)
			.single();

		const resume = resumes?.[0];

		const campaignStrategy = profile?.onboarding_data?.campaignStrategy ?? [];
		const hasApply = campaignStrategy.includes('apply');
		const hasConnect = campaignStrategy.includes('connect');
		const hasEmail = campaignStrategy.includes('email');

		const applications = prospects?.map((p) => {
			const launched = launchedApps?.find((app) => app.prospect_id === p.id);

			const messages =
				generatedMessages
					?.filter((m) => m.prospect_id === p.prospect_id)
					?.map((m) => ({ id: m.id, content: m.message_content, approved: m.approved })) || [];

			const approvedMessages = messages.filter((m) => m.approved);
			const match = matches?.find((m) => m.job_id === p.prospect_id);

			// Check if application meets Design requirements
			const hasMatch = Boolean(match);
			const hasResume = Boolean(resume?.id);
			const hasApprovedWriteMaterials = Boolean(approvedMessages?.length);

			// Determine if ready based on Design requirements
			let isReady = true; // Start with true, then check requirements

			// Match is always required
			if (!hasMatch) {
				isReady = false;
			}

			// Resume is required if Apply is selected
			if (hasApply && !hasResume) {
				isReady = false;
			}

			// Write materials are required if LinkedIn/Email is selected
			if ((hasConnect || hasEmail) && !hasApprovedWriteMaterials) {
				isReady = false;
			}

			const status = isReady ? 'ready' : 'drafted';

			return {
				id: p.id,
				user_id: p.user_id,
				job_id: p.id,
				prospect_id: p.id,
				job_title: p.job_title,
				company_name: p.company,
				job_url: p.url,
				location: p.location,
				posted_on: p.posted_on,
				match_id: match?.id,
				match_name: match?.selected_match?.name,
				match_title: match?.selected_match?.title,
				match_linkedin_url: match?.selected_match?.linkedin_url,
				status,
				has_match: hasMatch,
				has_write_materials: hasApprovedWriteMaterials, // Use approved messages only
				messages: approvedMessages, // Only return approved messages
				resume_id: resume?.id,
				resume_filename: resume?.file_name,
				gmail_connected: profile?.has_gmail_access,
				linkedin_connected: profile?.linkedin_connected,
				campaign_strategy: campaignStrategy,
				campaign: {
					apply: hasApply,
					connect: hasConnect,
					email: hasEmail
				},
				launched
			};
		});

		return jsonResponse(200, { applications });

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		console.error(err);
		return jsonResponse(500, { message: err.message });
	}
});
