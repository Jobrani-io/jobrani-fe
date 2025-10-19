import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { encodeBase64 } from 'jsr:@std/encoding/base64';
import { google } from 'npm:googleapis';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID') ?? '';
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '';

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

interface Email {
	from_user_id: string;
	recipient: string;
	subject: string;
	body: string;
}

Deno.serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	if (req.method !== 'POST') {
		return jsonResponse(405, { error: 'Method not allowed' });
	}

	const supabaseUser = createClient(
		Deno.env.get('SUPABASE_URL') ?? '',
		Deno.env.get('SUPABASE_ANON_KEY') ?? '',
		{
			global: {
				headers: { Authorization: req.headers.get('Authorization')! }
			}
		}
	);

	try {
		const {
			data: { user },
			error: authError
		} = await supabaseUser.auth.getUser();
		if (authError || !user) {
			return jsonResponse(401, { error: 'Unauthorized' });
		}

		const email: Email = await req.json();

		const { data: profile } = await supabase
			.from('profiles')
			.select('*')
			.eq('user_id', email.from_user_id)
			.eq('gmail_access', true)
			.single();

		if (!profile?.gmail_access) {
			return jsonResponse(500, { error: 'No gmail access on this profile' });
		}

		const { google_access_token, google_refresh_token } = profile;
		await sendEmailViaGmail(email, google_access_token, google_refresh_token);

		return jsonResponse(200, { message: 'Email sent!' });
	} catch (error) {
		console.error(error);
		const errorMessage = error instanceof Error ? error.message : String(error);
		return jsonResponse(500, { error: errorMessage });
	}
});

async function sendEmailViaGmail(message: Email, accessToken: string, refreshToken: string) {
	const auth = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
	auth.setCredentials({
		access_token: accessToken,
		refresh_token: refreshToken,
		expiry_date: true
	});

	const gmail = google.gmail({ version: 'v1', auth });
	const profile = await gmail.users.getProfile({ userId: 'me' });
	const from = profile.data.emailAddress;

	const { recipient, subject, body } = message;

	const utf8Subject = `=?utf-8?B?${encodeBase64(subject)}?=`;
	const messageParts = [
		`To: ${recipient}`,
		`From: ${from}`,
		'Content-Type: text/html; charset=utf-8',
		'MIME-Version: 1.0',
		`Subject: ${utf8Subject}`,
		'',
		body
	];

	const encodedMessage = encodeBase64(messageParts.join('\n'))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');

	const res = await gmail.users.messages.send({
		userId: 'me',
		requestBody: { raw: encodedMessage }
	});

	return res.data;
}
