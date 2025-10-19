import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET,PATCH',
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
	Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface AppUpdateBody {
	id: string;
	status?: 'in-progress' | 'completed' | 'failed';
	completed_at?: string;
	notes?: string;
	workflow_sequence?: Array<Record<string, string>>;
}

Deno.serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		const supabaseUser = createClient(
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
		} = await supabaseUser.auth.getUser();
		if (authError || !user || user?.user_metadata?.role !== 'admin') {
			return jsonResponse(401, { error: 'Unauthorized' });
		}

		switch (req.method) {
			case 'GET':
				return await getApplications();
			case 'PATCH': {
				const body: AppUpdateBody = await req.json();
				return await updateApplication(body);
			}
			default:
				return new Response('method not allowed', { status: 400 });
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		console.error(err);
		return jsonResponse(500, { message: err.message });
	}
});

async function getApplications() {
	const { data, error: fetchError } = await supabase
		.from('launched_applications')
		.select(
			`
					*,
					profiles (email, linkedin_username, linkedin_password, gmail_access),
					saved_prospects (*),
					preferred_matches (*),
					user_resumes (*)
				`
		)
		.order('created_at', { ascending: false });

	if (fetchError) throw fetchError;

	const applications = (data || []).map((app) => {
		const profile = app.profiles;
		const match = app.preferred_matches?.selected_match as Record<string, string>;
		const prospect = app.saved_prospects;
		const resume = app.user_resumes;

		return {
			id: app.id,
			user_id: app.user_id,
			user_email: profile?.email,
			prospect_id: app?.prospect_id,
			match_id: app?.match_id,
			job_title: prospect?.job_title,
			company_name: prospect?.company,
			match_name: match?.name,
			match_title: match?.title,
			match_linkedin_url: match?.linkedin_url,
			job_url: prospect?.url,
			workflow_sequence: app.workflow_sequence,
			campaign_type: app.campaign_type,
			status: app.status,
			messages: app.messages,
			resume_id: resume?.id,
			resume_filename: resume?.file_name,
			notes: app.notes,
			gmail_access: profile?.gmail_access,
			li_un: profile?.linkedin_username,
			li_pw: profile?.linkedin_password,
			launched_at: app.created_at,
			completed_at: app.completed_at
		};
	});

	return jsonResponse(200, { applications });
}

async function updateApplication(body: AppUpdateBody) {
	if (!body.id) {
		throw new Error('Invalid request');
	}

	const { id, status, completed_at, workflow_sequence, notes } = body;

	const payload: Record<string, unknown> = {};
	if (status) payload.status = status;
	if (completed_at || completed_at === null) payload.completed_at = completed_at;
	if (workflow_sequence) payload.workflow_sequence = workflow_sequence;
	if (notes) payload.notes = notes;

	const { error } = await supabase.from('launched_applications').update(payload).eq('id', id);
	if (error) throw error;

	return jsonResponse(200, { success: true });
}
