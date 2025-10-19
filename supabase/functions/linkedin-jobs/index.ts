import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET,POST,DELETE',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

interface LinkedInJob {
	id?: string;
	linkedin_job_id: string;
	user_id?: string;
	job_title: string;
	company_name: string;
	job_url?: string;
	location?: string;
	status?: string;
	posted_date?: string;
	created_at?: string;
	updated_at?: string;
}

function jsonResponse(status: number, body: unknown) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			...corsHeaders,
			'Content-Type': 'application/json'
		}
	});
}

Deno.serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
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
			return jsonResponse(401, { error: 'Unauthorized' });
		}

		switch (req.method) {
			case 'POST':
				return await handleSaveJob(req, supabaseClient, user.id);

			case 'DELETE':
				return await handleDeleteJob(req, supabaseClient, user.id);

			case 'GET': {
				// Check if linkedin_job_id parameter exists to determine which GET endpoint to use
				const url = new URL(req.url);
				const linkedinJobId = url.searchParams.get('linkedin_job_id');

				if (linkedinJobId) {
					return await handleGetJob(req, supabaseClient, user.id);
				} else {
					return await handleGetAllJobs(req, supabaseClient, user.id);
				}
			}

			default:
				return jsonResponse(405, { error: 'Method not allowed' });
		}
	} catch (error) {
		console.error('Error:', error);
		return jsonResponse(500, { error: 'Internal server error' });
	}
});

// Save a job to DB if it doesn't exist already
async function handleSaveJob(req: Request, supabaseClient: any, userId: string) {
	try {
		const body: LinkedInJob = await req.json();

		if (!body.linkedin_job_id) {
			return jsonResponse(400, { error: 'linkedin_job_id is required' });
		}

		const { data: existingJob } = await supabaseClient
			.from('linkedin_saved_jobs')
			.select('*')
			.eq('linkedin_job_id', body.linkedin_job_id)
			.eq('user_id', userId)
			.single();

		if (existingJob) {
			return jsonResponse(409, { error: 'Job already saved' });
		}

		const jobData = {
			...body,
			user_id: userId,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		};

		const { data, error } = await supabaseClient
			.from('linkedin_saved_jobs')
			.insert(jobData)
			.select()
			.single();

		if (error) {
			console.error('Database error:', error);
			return jsonResponse(500, { error: 'Failed to save job' });
		}

		return jsonResponse(201, { data, message: 'Job saved successfully' });
	} catch (error) {
		console.error('Error saving job:', error);
		return jsonResponse(400, { error: 'Invalid request body' });
	}
}

// DELETE a saved job by its linkedin_job_id
async function handleDeleteJob(req: Request, supabaseClient: any, userId: string) {
	try {
		const url = new URL(req.url);
		const linkedinJobId = url.searchParams.get('linkedin_job_id');

		if (!linkedinJobId) {
			return jsonResponse(400, { error: 'linkedin_job_id parameter is required' });
		}

		const { error } = await supabaseClient
			.from('linkedin_saved_jobs')
			.delete()
			.eq('linkedin_job_id', linkedinJobId)
			.eq('user_id', userId);

		if (error) {
			console.error('Database error:', error);
			return jsonResponse(500, { error: 'Failed to delete job' });
		}

		return jsonResponse(200, { message: 'Job deleted successfully' });
	} catch (error) {
		console.error('Error deleting job:', error);
		return jsonResponse(500, { error: 'Internal server error' });
	}
}

// GET a single job by linkedin_job_id
async function handleGetJob(req: Request, supabaseClient: any, userId: string) {
	try {
		const url = new URL(req.url);
		const linkedinJobId = url.searchParams.get('linkedin_job_id');

		if (!linkedinJobId) {
			return jsonResponse(400, { error: 'linkedin_job_id parameter is required' });
		}

		const { data, error } = await supabaseClient
			.from('linkedin_saved_jobs')
			.select('*')
			.eq('linkedin_job_id', linkedinJobId)
			.eq('user_id', userId)
			.single();

		if (error) {
			if (error.code === 'PGRST116') {
				return jsonResponse(404, { data: null, message: 'Job not found' });
			}
			console.error('Database error:', error);
			return jsonResponse(500, { error: 'Failed to retrieve job' });
		}

		return jsonResponse(200, { data, message: 'Job retrieved successfully' });
	} catch (error) {
		console.error('Error retrieving job:', error);
		return jsonResponse(500, { error: 'Internal server error' });
	}
}

// GET all saved jobs for a given user with pagination
async function handleGetAllJobs(req: Request, supabaseClient: any, userId: string) {
	try {
		const url = new URL(req.url);
		const limit = parseInt(url.searchParams.get('limit') ?? '10', 10);
		const offset = parseInt(url.searchParams.get('offset') ?? '0', 10);

		const { data, error } = await supabaseClient
			.from('linkedin_saved_jobs')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) {
			console.error('Database error:', error);
			return jsonResponse(500, { error: 'Failed to retrieve jobs' });
		}

		return jsonResponse(200, { data, message: 'Jobs retrieved successfully', limit, offset });
	} catch (error) {
		console.error('Error retrieving jobs:', error);
		return jsonResponse(500, { error: 'Internal server error' });
	}
}
