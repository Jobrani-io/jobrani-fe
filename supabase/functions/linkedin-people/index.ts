import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET,POST,DELETE',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

interface LinkedInPerson {
	id?: string;
	linkedin_id: string;
	user_id?: string;
	name: string;
	title: string;
	company: string;
	profile_url: string;
	status?: string;
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
				return await handleSavePerson(req, supabaseClient, user.id);

			case 'DELETE':
				return await handleDeletePerson(req, supabaseClient, user.id);

			case 'GET': {
				// Check if linkedin_person_id parameter exists to determine which GET endpoint to use
				const url = new URL(req.url);
				const linkedinPersonId = url.searchParams.get('linkedin_person_id');

				if (linkedinPersonId) {
					return await handleGetPerson(req, supabaseClient, user.id);
				} else {
					return await handleGetAllPeople(req, supabaseClient, user.id);
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

// Save a person to DB if they don't exist already
async function handleSavePerson(req: Request, supabaseClient: any, userId: string) {
	try {
		const body: LinkedInPerson = await req.json();

		if (!body.linkedin_id) {
			return jsonResponse(400, { error: 'linkedin_id is required' });
		}

		const { data: existingPerson } = await supabaseClient
			.from('linkedin_saved_people')
			.select('*')
			.eq('linkedin_id', body.linkedin_id)
			.eq('user_id', userId)
			.single();

		if (existingPerson) {
			return jsonResponse(409, { error: 'Person already saved' });
		}

		const personData = {
			...body,
			user_id: userId,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		};

		const { data, error } = await supabaseClient
			.from('linkedin_saved_people')
			.insert(personData)
			.select()
			.single();

		if (error) {
			console.error('Database error:', error);
			return jsonResponse(500, { error: 'Failed to save person' });
		}

		return jsonResponse(201, { data, message: 'Person saved successfully' });
	} catch (error) {
		console.error('Error saving person:', error);
		return jsonResponse(400, { error: 'Invalid request body' });
	}
}

// DELETE a saved person by their linkedin_id
async function handleDeletePerson(req: Request, supabaseClient: any, userId: string) {
	try {
		const url = new URL(req.url);
		const linkedinPersonId = url.searchParams.get('linkedin_person_id');

		if (!linkedinPersonId) {
			return jsonResponse(400, { error: 'linkedin_person_id parameter is required' });
		}

		const { error } = await supabaseClient
			.from('linkedin_saved_people')
			.delete()
			.eq('linkedin_id', linkedinPersonId)
			.eq('user_id', userId);

		if (error) {
			console.error('Database error:', error);
			return jsonResponse(500, { error: 'Failed to delete person' });
		}

		return jsonResponse(200, { message: 'Person deleted successfully' });
	} catch (error) {
		console.error('Error deleting person:', error);
		return jsonResponse(500, { error: 'Internal server error' });
	}
}

// GET a single person by their linkedin_id
async function handleGetPerson(req: Request, supabaseClient: any, userId: string) {
	try {
		const url = new URL(req.url);
		const linkedinPersonId = url.searchParams.get('linkedin_person_id');

		if (!linkedinPersonId) {
			return jsonResponse(400, { error: 'linkedin_person_id parameter is required' });
		}

		const { data, error } = await supabaseClient
			.from('linkedin_saved_people')
			.select('*')
			.eq('linkedin_id', linkedinPersonId)
			.eq('user_id', userId)
			.single();

		if (error) {
			if (error.code === 'PGRST116') {
				return jsonResponse(404, { data: null, message: 'Person not found' });
			}
			console.error('Database error:', error);
			return jsonResponse(500, { error: 'Failed to retrieve person' });
		}

		return jsonResponse(200, { data, message: 'Person retrieved successfully' });
	} catch (error) {
		console.error('Error retrieving person:', error);
		return jsonResponse(500, { error: 'Internal server error' });
	}
}

// GET all saved people for a given user with pagination
async function handleGetAllPeople(req: Request, supabaseClient: any, userId: string) {
	try {
		const url = new URL(req.url);
		const limit = parseInt(url.searchParams.get('limit') ?? '10', 10);
		const offset = parseInt(url.searchParams.get('offset') ?? '0', 10);

		const { data, error } = await supabaseClient
			.from('linkedin_saved_people')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) {
			console.error('Database error:', error);
			return jsonResponse(500, { error: 'Failed to retrieve people' });
		}

		return jsonResponse(200, { data, message: 'People retrieved successfully', limit, offset });
	} catch (error) {
		console.error('Error retrieving people:', error);
		return jsonResponse(500, { error: 'Internal server error' });
	}
}
