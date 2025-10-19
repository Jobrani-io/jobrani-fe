// Unified mock data source for all modules (Prospect, Match, Write)
// This ensures consistent prospects appear across the entire application in mock mode

import { ProspectSearchResult, ProspectSearchStats } from '@/types/prospectSearch';
import {
	SavedProspect,
	JobMatch,
	PreferredMatch,
	MatchService,
	BulkJobMatchRequest
} from '@/services/savedProspectsService';
import { type JobApplication } from '@/contexts/ApplicationsContext';
import { LaunchedApplication } from '@/hooks/useLaunchedApplications';

// ============= UNIFIED PROSPECT DATA =============
// These are the core prospects that will appear consistently across all modules

export interface UnifiedProspect {
	id: string;
	name: string;
	company: string;
	job_title: string;
	location: string;
	posted_on: string;
	url: string;
	industry: string;
	contact_type: 'decision-maker' | 'recruiter' | 'peer';
	job_opening: string;
	linkedin_url: string;
}

export const unifiedProspects: UnifiedProspect[] = [
	{
		id: 'prospect-stripe-1',
		name: 'Sarah Chen',
		company: 'Stripe',
		job_title: 'Senior Product Manager, Growth',
		location: 'San Francisco, CA',
		posted_on: '2024-01-15',
		url: 'https://stripe.com/careers',
		industry: 'Financial Technology',
		contact_type: 'decision-maker',
		job_opening: 'Principal Product Manager - Growth',
		linkedin_url: 'https://linkedin.com/in/sarah-chen-stripe'
	},
	{
		id: 'prospect-notion-1',
		name: 'Elena Vasquez',
		company: 'Notion',
		job_title: 'Chief Product Officer',
		location: 'Remote',
		posted_on: '2024-01-12',
		url: 'https://notion.so/careers',
		industry: 'Software',
		contact_type: 'decision-maker',
		job_opening: 'VP of Product',
		linkedin_url: 'https://linkedin.com/in/elena-vasquez-notion'
	},
	{
		id: 'prospect-figma-1',
		name: 'Jennifer Walsh',
		company: 'Figma',
		job_title: 'Head of Product, Core Editor',
		location: 'New York, NY',
		posted_on: '2024-01-10',
		url: 'https://figma.com/careers',
		industry: 'Design Technology',
		contact_type: 'decision-maker',
		job_opening: 'Staff Product Manager',
		linkedin_url: 'https://linkedin.com/in/jennifer-walsh-figma'
	},
	{
		id: 'prospect-linear-1',
		name: 'Karri Saarinen',
		company: 'Linear',
		job_title: 'Co-founder & CEO',
		location: 'San Francisco, CA',
		posted_on: '2024-01-08',
		url: 'https://linear.app/careers',
		industry: 'Software',
		contact_type: 'decision-maker',
		job_opening: 'Head of Product',
		linkedin_url: 'https://linkedin.com/in/karri-saarinen'
	},
	{
		id: 'prospect-anthropic-1',
		name: 'Tom Brown',
		company: 'Anthropic',
		job_title: 'Head of Product',
		location: 'San Francisco, CA',
		posted_on: '2024-01-05',
		url: 'https://anthropic.com/careers',
		industry: 'Artificial Intelligence',
		contact_type: 'decision-maker',
		job_opening: 'Product Manager - AI Safety',
		linkedin_url: 'https://linkedin.com/in/tom-brown-anthropic'
	},
	{
		id: 'prospect-coinbase-1',
		name: 'Surojit Chatterjee',
		company: 'Coinbase',
		job_title: 'Chief Product Officer',
		location: 'Remote',
		posted_on: '2024-01-03',
		url: 'https://coinbase.com/careers',
		industry: 'Cryptocurrency',
		contact_type: 'decision-maker',
		job_opening: 'Principal Product Manager - Trading',
		linkedin_url: 'https://linkedin.com/in/surojit-chatterjee'
	},
	{
		id: 'prospect-jnj-1',
		name: 'Lisa Patel',
		company: 'Johnson & Johnson',
		job_title: 'VP of Digital Innovation',
		location: 'New Brunswick, NJ',
		posted_on: '2024-01-01',
		url: 'https://jnj.com/careers',
		industry: 'Healthcare',
		contact_type: 'decision-maker',
		job_opening: 'Senior Product Manager - Digital Health',
		linkedin_url: 'https://linkedin.com/in/lisa-patel-jnj'
	},
	{
		id: 'prospect-zapier-1',
		name: 'Michael Torres',
		company: 'Zapier',
		job_title: 'Director of Product',
		location: 'Remote',
		posted_on: '2023-12-28',
		url: 'https://zapier.com/careers',
		industry: 'Software',
		contact_type: 'decision-maker',
		job_opening: 'Senior Product Manager - Integrations',
		linkedin_url: 'https://linkedin.com/in/michael-torres-zapier'
	}
];

// ============= PROSPECT MODULE DATA =============
// Transform unified data for ProspectModule

export const getUnifiedProspectSearchResults = (
	startIndex: number = 0,
	count: number = 50
): ProspectSearchResult[] => {
	const results: ProspectSearchResult[] = [];

	for (let i = 0; i < count; i++) {
		const prospectIndex = (startIndex + i) % unifiedProspects.length;
		const prospect = unifiedProspects[prospectIndex];

		results.push({
			id: `${prospect.id}-search-${startIndex + i + 1}`,
			name: prospect.name,
			companyName: prospect.company,
			jobTitle: prospect.job_opening, // Use job_opening as the search result title
			location: prospect.location,
			linkedinUrl: prospect.linkedin_url,
			isCompleted: false,
			status: 'ready-to-complete'
		});
	}

	return results;
};

export const getUnifiedProspectSearchStats = (
	currentResults: ProspectSearchResult[]
): ProspectSearchStats => {
	const completed = currentResults.filter((p) => p.isCompleted).length;
	const readyToComplete = currentResults.filter((p) => !p.isCompleted).length;

	return {
		total: 173419935, // Keep the large number for realism
		previewing: currentResults.length,
		willBeImported: readyToComplete
	};
};

// ============= MATCH MODULE DATA =============
// Transform unified data for MatchModule

// Runtime tracking of saved prospects - pre-populate with some prospects
const runtimeSavedProspects = new Set<string>([
	'prospect-stripe-1',
	'prospect-notion-1',
	'prospect-figma-1',
	'prospect-linear-1',
	'prospect-anthropic-1'
]);

export const getUnifiedSavedProspects = (): SavedProspect[] => {
	return unifiedProspects
		.filter((prospect) => runtimeSavedProspects.has(prospect.id))
		.map((prospect, index) => ({
			id: `sp-${prospect.id}`,
			user_id: 'mock-user-id',
			prospect_id: prospect.id,
			company: prospect.company,
			job_title: prospect.job_opening,
			location: prospect.location,
			posted_on: prospect.posted_on,
			saved_date: new Date(Date.now() - index * 86400000).toISOString(),
			url: prospect.url,
			employment_type: 'Full-time',
			is_remote: Math.random() > 0.5
		}));
};

// Job matches for each prospect
export const unifiedJobMatchesMap: Map<string, JobMatch[]> = new Map([
	[
		'prospect-stripe-1',
		[
			{
				name: 'Sarah Chen',
				title: 'Senior Product Manager, Growth',
				linkedin_url: 'https://linkedin.com/in/sarah-chen-stripe',
				confidence: 92,
				reason:
					'Direct hiring manager for Growth team with 5+ years at Stripe. Recently posted about team expansion and has hiring authority.'
			},
			{
				name: 'Marcus Rivera',
				title: 'Director of Product, Core Platform',
				linkedin_url: 'https://linkedin.com/in/marcus-rivera',
				confidence: 78,
				reason:
					'Cross-functional leader who collaborates with Growth team. Has posted about product manager hiring recently.'
			}
		]
	],
	[
		'prospect-notion-1',
		[
			{
				name: 'Elena Vasquez',
				title: 'Chief Product Officer',
				linkedin_url: 'https://linkedin.com/in/elena-vasquez-notion',
				confidence: 88,
				reason:
					'CPO with direct authority over VP-level hires. Active on LinkedIn discussing product strategy and team building.'
			},
			{
				name: 'David Kim',
				title: 'VP of Engineering',
				linkedin_url: 'https://linkedin.com/in/david-kim-notion',
				confidence: 65,
				reason:
					'Close collaborator with product organization. Likely involved in senior product leadership decisions.'
			}
		]
	],
	[
		'prospect-figma-1',
		[
			{
				name: 'Jennifer Walsh',
				title: 'Head of Product, Core Editor',
				linkedin_url: 'https://linkedin.com/in/jennifer-walsh-figma',
				confidence: 85,
				reason:
					'Product leader for core product areas. Has posted about growing the product team and scaling design tools.'
			},
			{
				name: 'Alex Thompson',
				title: 'Senior Product Manager',
				linkedin_url: 'https://linkedin.com/in/alex-thompson-figma',
				confidence: 72,
				reason:
					'Peer-level contact who can provide referrals and insights into team culture and hiring process.'
			}
		]
	],
	[
		'prospect-linear-1',
		[
			{
				name: 'Karri Saarinen',
				title: 'Co-founder & CEO',
				linkedin_url: 'https://linkedin.com/in/karri-saarinen',
				confidence: 95,
				reason:
					'Co-founder and CEO with direct decision-making authority. Personally involved in senior leadership hires.'
			},
			{
				name: 'Jori Lallo',
				title: 'Co-founder & CTO',
				linkedin_url: 'https://linkedin.com/in/jori-lallo',
				confidence: 90,
				reason:
					'Technical co-founder who works closely with product organization. Involved in senior product leadership decisions.'
			}
		]
	],
	[
		'prospect-anthropic-1',
		[
			{
				name: 'Tom Brown',
				title: 'Head of Product',
				linkedin_url: 'https://linkedin.com/in/tom-brown-anthropic',
				confidence: 89,
				reason:
					'Direct reporting manager for product roles. Expertise in AI product development and safety considerations.'
			},
			{
				name: 'Catherine Olsson',
				title: 'Director of AI Safety Research',
				linkedin_url: 'https://linkedin.com/in/catherine-olsson',
				confidence: 74,
				reason:
					'Research leader who collaborates closely with product on safety initiatives. Strong influence on safety-focused product hires.'
			}
		]
	],
	[
		'prospect-coinbase-1',
		[
			{
				name: 'Surojit Chatterjee',
				title: 'Chief Product Officer',
				linkedin_url: 'https://linkedin.com/in/surojit-chatterjee',
				confidence: 91,
				reason:
					'CPO with authority over principal-level product hires. Focus on trading and core product experiences.'
			},
			{
				name: 'Tim Wagner',
				title: 'VP of Product, Trading',
				linkedin_url: 'https://linkedin.com/in/tim-wagner-coinbase',
				confidence: 86,
				reason:
					'Direct hiring manager for trading product roles. Deep expertise in financial products and crypto trading.'
			}
		]
	],
	[
		'prospect-jnj-1',
		[
			{
				name: 'Lisa Patel',
				title: 'VP of Digital Innovation',
				linkedin_url: 'https://linkedin.com/in/lisa-patel-jnj',
				confidence: 83,
				reason:
					'Digital health product leader. Recently posted about expanding digital health capabilities and team growth.'
			}
		]
	],
	[
		'prospect-zapier-1',
		[
			{
				name: 'Michael Torres',
				title: 'Director of Product',
				linkedin_url: 'https://linkedin.com/in/michael-torres-zapier',
				confidence: 87,
				reason:
					'Product leader for integrations platform. Has hiring authority and recently mentioned team expansion plans.'
			},
			{
				name: 'Jessica Park',
				title: 'Senior Product Manager, Platform',
				linkedin_url: 'https://linkedin.com/in/jessica-park-zapier',
				confidence: 69,
				reason:
					'Platform product expert who can provide insights into integrations team and advocate for candidates.'
			}
		]
	]
]);

// Map of preferred matches - dynamically populated from Match module's persisted state
export const getUnifiedPreferredMatches = (): Map<string, PreferredMatch> => {
	const matches = new Map<string, PreferredMatch>();

	console.log('DEBUG - getUnifiedPreferredMatches called');

	// Read actual approved matches from Match module's persisted state
	try {
		const storedApproved = localStorage.getItem('matchModule-approvedJobs-v3');
		console.log('DEBUG - stored approved jobs:', storedApproved);

		if (storedApproved) {
			const parsed = JSON.parse(storedApproved);
			const approvedJobsArray = parsed.value ? parsed.value : parsed;

			console.log('DEBUG - parsed approved jobs:', approvedJobsArray);

			// Convert approved jobs to preferred matches format
			approvedJobsArray.forEach((job: any) => {
				if (job.isApproved && job.autoSelectedContact) {
					// Extract prospect_id from job.id (e.g., "sp-prospect-linear-1" -> "prospect-linear-1")
					const prospectId = job.id.startsWith('sp-') ? job.id.substring(3) : job.id;

					const match: PreferredMatch = {
						id: `pm-${prospectId}`,
						user_id: 'mock-user-id',
						prospect_id: prospectId,
						selected_match: job.autoSelectedContact,
						preferred_at: new Date().toISOString()
					};
					matches.set(prospectId, match);
					console.log(
						'DEBUG - Added preferred match for:',
						prospectId,
						job.autoSelectedContact
					);
				}
			});
		}
	} catch (error) {
		console.log('No persisted match approvals found');
	}

	console.log(
		'DEBUG - Final matches map size:',
		matches.size,
		'keys:',
		Array.from(matches.keys())
	);
	return matches;
};

// ============= WRITE MODULE DATA =============
// Transform unified data for WriteModule

export interface UnifiedWriteProspect {
	id: string;
	name: string;
	company: string;
	job_title: string;
	industry: string;
	contact_type: string;
	job_opening?: string;
}

export const getUnifiedWriteProspects = (): UnifiedWriteProspect[] => {
	return unifiedProspects.map((prospect) => ({
		id: prospect.id,
		name: prospect.name,
		company: prospect.company,
		job_title: prospect.job_title,
		industry: prospect.industry,
		contact_type: prospect.contact_type,
		job_opening: prospect.job_opening
	}));
};

// Resume data and stats
export const unifiedResumeData = {
	fileName: 'John_Doe_Resume_2024.pdf',
	content: 'Sample resume content...',
	highlights:
		'• 5+ years Product Management experience at high-growth startups\n• Led growth initiatives increasing ARR from $2M to $15M\n• Expert in A/B testing, user research, and data-driven product decisions\n• Experience with B2B SaaS, marketplaces, and consumer mobile apps\n• Led cross-functional teams of 8-12 engineers, designers, and analysts\n• Launched 3 major product features that increased user retention by 40%'
};

export const unifiedDailyStats = {
	used: 7,
	limit: 15,
	remaining: 8
};

// Generated messages using unified prospects
export interface UnifiedGeneratedMessage {
	prospect: UnifiedWriteProspect;
	message: string;
	messageId: string;
	approved?: boolean;
	messageType?: 'LinkedIn Connect' | 'Follow-up' | 'InMail';
}

export const getUnifiedGeneratedMessages = (): UnifiedGeneratedMessage[] => {
	const allWriteProspects = getUnifiedWriteProspects();

	// Only include prospects that have been approved in Match module
	const preferredMatches = getUnifiedPreferredMatches(); // Get fresh data
	const approvedProspectIds = Array.from(preferredMatches.keys());
	const writeProspects = allWriteProspects.filter((prospect) =>
		approvedProspectIds.includes(prospect.id)
	);

	// Read actual approved messages from Write module's persisted state
	let persistedMessages: any[] = [];
	try {
		const stored = localStorage.getItem('createModule-generatedMessages-v3');
		console.log('DEBUG - stored messages:', stored);
		if (stored) {
			const parsed = JSON.parse(stored);
			// Handle both old and new storage format
			persistedMessages = parsed.value ? parsed.value : parsed;
			console.log('DEBUG - parsed messages:', persistedMessages);
		}
	} catch (error) {
		console.log('No persisted messages found, using defaults');
	}

	const messages = [
		"Hi {name}, I noticed your work on {company}'s growth initiatives and your experience with {job_title}. Your expertise aligns perfectly with my background in driving ARR growth from $2M to $15M at previous startups. I'd love to connect and learn more about the {job_opening} role - I have specific ideas that might interest you.",
		"{name}, I've been following {company}'s incredible product evolution and your leadership role. My experience leading cross-functional teams and launching features that increased retention by 40% aligns well with {company}'s user-centric approach. Would love to discuss the {job_opening} opportunity.",
		"{name}, I'm reaching out regarding the {job_opening} position at {company}. With my 5+ years in product management and proven track record in B2B SaaS growth, I believe I could bring valuable insights to your {industry} initiatives. Would you be open to a brief conversation?",
		"{name}, I admire {company}'s impact and would love to connect with a fellow product leader. Your work resonates with my experience in user research and A/B testing. I'm interested in the {job_opening} role and would appreciate any insights you could share."
	];

	const messageTypes: ('LinkedIn Connect' | 'Follow-up' | 'InMail')[] = [
		'LinkedIn Connect',
		'Follow-up',
		'InMail'
	];

	return writeProspects.map((prospect, index) => {
		// Check if there's a preferred match for this prospect
		const preferredMatch = preferredMatches.get(prospect.id); // Use fresh data

		// Use preferred contact's information if available, otherwise use default prospect data
		const contactName = preferredMatch?.selected_match.name || prospect.name;
		const contactJobTitle = preferredMatch?.selected_match.title || prospect.job_title;

		// Always use the original job_opening (what they're applying for)
		const jobOpening = prospect.job_opening || prospect.job_title;

		// Create an enhanced prospect object with preferred contact information
		const enhancedProspect: UnifiedWriteProspect = {
			...prospect,
			name: contactName,
			job_title: contactJobTitle
		};

		const template = messages[index % messages.length];
		const message = template
			.replace(/{name}/g, contactName)
			.replace(/{company}/g, prospect.company)
			.replace(/{job_title}/g, contactJobTitle)
			.replace(/{job_opening}/g, jobOpening)
			.replace(/{industry}/g, prospect.industry);

		const messageId = `unified-msg-${index + 1}`;

		// Check if this message has been approved in the Write module
		const persistedMessage = persistedMessages.find(
			(msg) => msg.prospect.id === prospect.id || msg.messageId === messageId
		);
		const approved = persistedMessage ? persistedMessage.approved || false : false;

		return {
			prospect: enhancedProspect,
			messageId,
			message,
			approved,
			messageType: messageTypes[index % messageTypes.length]
		};
	});
};

// ============= UNIFIED MOCK SERVICES =============

export class UnifiedMatchDataService implements MatchService {
	private static instance: UnifiedMatchDataService;

	static getInstance(): UnifiedMatchDataService {
		if (!UnifiedMatchDataService.instance) {
			UnifiedMatchDataService.instance = new UnifiedMatchDataService();
		}
		return UnifiedMatchDataService.instance;
	}

	private async delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async getSavedProspects(): Promise<SavedProspect[]> {
		await this.delay(800);
		return getUnifiedSavedProspects();
	}

	async getJobMatches(prospectId: string): Promise<JobMatch[]> {
		await this.delay(2000 + Math.random() * 2000);
		return unifiedJobMatchesMap.get(prospectId) || [];
	}

	async getBulkJobMatches(prospects: BulkJobMatchRequest[]): Promise<Map<string, JobMatch[]>> {
		await this.delay(3000 + Math.random() * 2000);
		const results = new Map<string, JobMatch[]>();
		prospects.forEach((prospect) => {
			const matches = unifiedJobMatchesMap.get(prospect.prospectId) || [];
			results.set(prospect.prospectId, matches);
		});
		return results;
	}

	async getPreferredMatch(prospectId: string): Promise<PreferredMatch | null> {
		await this.delay(300);
		const preferredMatches = getUnifiedPreferredMatches();
		return preferredMatches.get(prospectId) || null;
	}

	async setPreferredMatch(prospectId: string, selectedMatch: JobMatch): Promise<PreferredMatch> {
		await this.delay(500);
		const preferred: PreferredMatch = {
			id: `pm-${Date.now()}`,
			user_id: 'mock-user-id',
			prospect_id: prospectId,
			selected_match: selectedMatch,
			preferred_at: new Date().toISOString()
		};

		// Store in localStorage (this will be read by getUnifiedPreferredMatches)
		try {
			const currentData = localStorage.getItem('matchModule-approvedJobs-v3') || '[]';
			const parsed = JSON.parse(currentData);
			const approvedJobsArray = parsed.value ? parsed.value : parsed;

			// Update or add the preferred match
			const existingIndex = approvedJobsArray.findIndex((job: any) => job.id === prospectId);
			const jobData = {
				id: prospectId,
				isApproved: true,
				autoSelectedContact: selectedMatch,
				enhancedContacts: [selectedMatch]
			};

			if (existingIndex >= 0) {
				approvedJobsArray[existingIndex] = jobData;
			} else {
				approvedJobsArray.push(jobData);
			}

			localStorage.setItem(
				'matchModule-approvedJobs-v3',
				JSON.stringify({ value: approvedJobsArray })
			);
		} catch (error) {
			console.log('Error storing preferred match:', error);
		}

		return preferred;
	}

	async removePreferredMatch(prospectId: string): Promise<boolean> {
		await this.delay(300);

		// Remove from localStorage
		try {
			const currentData = localStorage.getItem('matchModule-approvedJobs-v3') || '[]';
			const parsed = JSON.parse(currentData);
			const approvedJobsArray = parsed.value ? parsed.value : parsed;

			const filteredArray = approvedJobsArray.filter((job: any) => job.id !== prospectId);
			localStorage.setItem(
				'matchModule-approvedJobs-v3',
				JSON.stringify({ value: filteredArray })
			);
		} catch (error) {
			console.log('Error removing preferred match:', error);
		}

		// In mock mode, we can't actually delete from database, but we log it
		console.log(`Mock: Would delete write materials for removed match: ${prospectId}`);

		// Clear localStorage cache for write materials in mock mode too
		localStorage.removeItem("createModule-generatedMessages-v3");

		return true;
	}


	async isProspectSaved(prospectId: string): Promise<boolean> {
		await this.delay(200);
		return runtimeSavedProspects.has(prospectId);
	}

	async saveProspect(prospectData: {
		prospect_id: string;
		company: string;
		job_title: string;
		location?: string;
		posted_on?: string;
		url?: string;
	}): Promise<SavedProspect> {
		await this.delay(500);
		runtimeSavedProspects.add(prospectData.prospect_id);
		return {
			id: `sp-${prospectData.prospect_id}`,
			user_id: 'mock-user-id',
			prospect_id: prospectData.prospect_id,
			company: prospectData.company,
			job_title: prospectData.job_title,
			location: prospectData.location,
			posted_on: prospectData.posted_on,
			saved_date: new Date().toISOString(),
			url: prospectData.url,
			employment_type: 'Full-time',
			is_remote: Math.random() > 0.5
		};
	}

	async deleteSavedProspect(prospectId: string): Promise<boolean> {
		await this.delay(300);
		runtimeSavedProspects.delete(prospectId);
		// Also remove any preferred matches when prospect is unsaved
		try {
			const currentData = localStorage.getItem('matchModule-approvedJobs-v3') || '[]';
			const parsed = JSON.parse(currentData);
			const approvedJobsArray = parsed.value ? parsed.value : parsed;

			const filteredArray = approvedJobsArray.filter((job: any) => job.id !== prospectId);
			localStorage.setItem(
				'matchModule-approvedJobs-v3',
				JSON.stringify({ value: filteredArray })
			);
		} catch (error) {
			console.log('Error removing preferred match during prospect deletion:', error);
		}
		return true;
	}
}

export const unifiedMatchDataService = UnifiedMatchDataService.getInstance();

// ============= APPLICATION LIFECYCLE DATA =============
// Re-export interfaces for consistency
export type { JobApplication } from '@/contexts/ApplicationsContext';
export type { LaunchedApplication } from '@/hooks/useLaunchedApplications';

export interface UnifiedJobApplication {
	id: string;
	user_id: string;
	job_id: string;
	job_title: string;
	company_name: string;
	job_url?: string;
	location?: string;
	posted_on?: string;

	// Match information
	prospect_id?: string;
	prospect_name?: string;
	prospect_title?: string;
	prospect_linkedin_url?: string;

	// Completion tracking
	has_prospect: boolean;
	has_match: boolean;
	has_write_materials: boolean;

	// Status tracking
	status: 'drafted' | 'ready' | 'sent';

	// Timestamps
	created_at: string;
	updated_at: string;
	launched_at?: string;
	completed_at?: string;

	// Additional data
	messages_sent?: Array<{
		type: string;
		content: string;
		sent_at: string;
	}>;
	resume_filename?: string;
	campaign_type?: 'self-apply' | 'apply-for-me';
	workflow_sequence?: string[];
}

export interface UnifiedLaunchedApplication {
	id: string;
	user_id: string;
	job_id?: string;
	prospect_id?: string;
	job_title: string;
	company_name: string;
	prospect_name?: string;
	prospect_title?: string;
	job_url?: string;
	workflow_sequence: string[];
	campaign_type: 'self-apply' | 'apply-for-me';
	status: 'in-progress' | 'completed' | 'failed';
	messages_sent?: Array<{
		type: string;
		content: string;
		sent_at: string;
	}>;
	resume_filename?: string;
	resume_id?: string;
	launched_at: string;
	completed_at?: string;
	created_at: string;
	updated_at: string;
}

// Generate drafted applications from prospects that are saved but incomplete
export const getUnifiedDraftedApplications = (): JobApplication[] => {
	const savedProspects = getUnifiedSavedProspects();
	const preferredMatches = getUnifiedPreferredMatches();

	return savedProspects
		.filter((prospect) => {
			const hasMatch = preferredMatches.has(prospect.prospect_id);
			const hasMessages = hasMatch; // For now, messages depend on matches
			// Drafted = has prospect but missing match OR messages
			return !hasMatch || !hasMessages;
		})
		.map((prospect) => ({
			id: `draft-${prospect.prospect_id}`,
			user_id: 'mock-user-id',
			job_id: `job-${prospect.prospect_id}`,
			job_title: prospect.job_title,
			company_name: prospect.company,
			job_url: prospect.url,
			location: prospect.location,
			posted_on: prospect.posted_on,
			prospect_id: prospect.prospect_id,
			has_prospect: true,
			has_match: preferredMatches.has(prospect.prospect_id),
			has_write_materials: false, // Drafted don't have write materials yet
			status: 'drafted' as const,
			created_at: prospect.saved_date,
			updated_at: prospect.saved_date
		}));
};

// Generate ready applications from prospects with both matches and messages
export const getUnifiedReadyApplications = (): JobApplication[] => {
	const savedProspects = getUnifiedSavedProspects();
	const generatedMessages = getUnifiedGeneratedMessages();
	const preferredMatches = getUnifiedPreferredMatches();

	console.log('DEBUG - Ready Applications Check:', {
		savedProspects: savedProspects.length,
		generatedMessages: generatedMessages.length,
		preferredMatches: preferredMatches.size,
		savedProspectIds: savedProspects.map((p) => p.prospect_id),
		preferredMatchIds: Array.from(preferredMatches.keys()),
		approvedMessages: generatedMessages.filter((msg) => msg.approved).length
	});

	return savedProspects
		.filter((prospect) => {
			const hasMatch = preferredMatches.has(prospect.prospect_id);
			const hasMessages = generatedMessages.some(
				(msg) => msg.prospect.id === prospect.prospect_id && msg.approved
			);

			console.log(`DEBUG - Prospect ${prospect.prospect_id}:`, {
				hasMatch,
				hasMessages,
				company: prospect.company,
				matchingMessages: generatedMessages.filter(
					(msg) => msg.prospect.id === prospect.prospect_id
				)
			});

			return hasMatch && hasMessages;
		})
		.map((prospect) => {
			const preferredMatch = preferredMatches.get(prospect.prospect_id);
			const messages = generatedMessages.filter(
				(msg) => msg.prospect.id === prospect.prospect_id
			);

			return {
				id: `ready-${prospect.prospect_id}`,
				user_id: 'mock-user-id',
				job_id: `job-${prospect.prospect_id}`,
				job_title: prospect.job_title,
				company_name: prospect.company,
				job_url: prospect.url,
				location: prospect.location,
				posted_on: prospect.posted_on,
				prospect_id: prospect.prospect_id,
				prospect_name: preferredMatch?.selected_match.name,
				prospect_title: preferredMatch?.selected_match.title,
				prospect_linkedin_url: preferredMatch?.selected_match.linkedin_url,
				has_prospect: true,
				has_match: true,
				has_write_materials: true,
				status: 'ready' as const,
				messages_sent: messages.map((msg) => ({
					type: msg.messageType || 'LinkedIn Connect',
					content: msg.message,
					sent_at: new Date().toISOString()
				})),
				resume_filename: 'Resume_Updated_2024.pdf',
				campaign_type: 'apply-for-me' as const,
				workflow_sequence: ['connect', 'apply', 'email'],
				created_at: prospect.saved_date,
				updated_at: new Date().toISOString()
			};
		});
};

// Runtime tracking of launched applications
let runtimeLaunchedApplications: LaunchedApplication[] = [];

// Initialize with some default launched applications for demo
const initializeLaunchedApplications = () => {
	if (runtimeLaunchedApplications.length === 0) {
		const readyApps = getUnifiedReadyApplications();

		// Take some ready apps and make them "launched" for demo
		runtimeLaunchedApplications = readyApps.slice(0, 1).map((app, index) => ({
			id: `launched-${app.prospect_id}`,
			user_id: app.user_id,
			job_id: app.job_id,
			prospect_id: app.prospect_id,
			job_title: app.job_title,
			company_name: app.company_name,
			prospect_name: app.prospect_name,
			prospect_title: app.prospect_title,
			job_url: app.job_url,
			workflow_sequence: app.workflow_sequence || ['connect', 'apply'],
			campaign_type: app.campaign_type || 'apply-for-me',
			status: 'in-progress' as const,
			messages_sent: app.messages_sent,
			resume_filename: app.resume_filename,
			launched_at: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
			completed_at: undefined,
			created_at: app.created_at,
			updated_at: new Date().toISOString()
		}));
	}
};

// Generate launched applications from both persisted runtime data and demo data
export const getUnifiedLaunchedApplications = (): LaunchedApplication[] => {
	initializeLaunchedApplications();

	// Also check localStorage for any launched applications
	try {
		const stored = localStorage.getItem('unifiedMockData-launchedApplications');
		if (stored) {
			const persistedApps = JSON.parse(stored);
			// Merge with runtime applications, avoiding duplicates
			persistedApps.forEach((app: LaunchedApplication) => {
				const exists = runtimeLaunchedApplications.find((existing) => existing.id === app.id);
				if (!exists) {
					runtimeLaunchedApplications.push(app);
				}
			});
		}
	} catch (error) {
		console.log('No persisted launched applications found');
	}

	return [...runtimeLaunchedApplications];
};

// Add a new launched application
export const addLaunchedApplication = (application: LaunchedApplication) => {
	runtimeLaunchedApplications.push(application);

	// Persist to localStorage
	try {
		localStorage.setItem(
			'unifiedMockData-launchedApplications',
			JSON.stringify(runtimeLaunchedApplications)
		);
	} catch (error) {
		console.error('Failed to persist launched application:', error);
	}
};

// Unified Write Module service
export const unifiedWriteDataService = {
	processResume: async (fileName: string, content: string) => {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({ highlights: unifiedResumeData.highlights });
			}, 2000);
		});
	},

	generateMessages: async (customInstructions?: string) => {
		return new Promise((resolve) => {
			setTimeout(() => {
				const messages = getUnifiedGeneratedMessages();
				resolve({
					messages: messages.map((msg) => ({ ...msg, approved: false })),
					dailyStats: unifiedDailyStats
				});
			}, 3000);
		});
	},

	getDailyStats: () => unifiedDailyStats,
	getResumeData: () => unifiedResumeData
};
