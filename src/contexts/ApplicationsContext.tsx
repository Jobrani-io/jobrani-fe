import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface JobApplication {
	id: string;
	user_id: string;
	job_id: string;
	prospect_id: string;
	job_title: string;
	company_name: string;
	job_url: string;
	location?: string;
	posted_on?: string;
	match_id?: string;
	match_name?: string;
	match_title?: string;
	match_linkedin_url?: string;
	has_match: boolean;
	has_write_materials: boolean;
	campaign_type: 'self-apply' | 'apply-for-me';
	status: 'drafted' | 'ready' | 'sent';
	messages: Array<{
		id: string;
		content: string;
	}>;
	resume_id?: string;
	resume_filename?: string;
	gmail_connected: boolean;
	linkedin_connected: boolean;
	campaign_strategy: string[];
	campaign: {
		apply: boolean;
		connect: boolean;
		email: boolean;
	};
	launched?: {
		status: 'in-progress' | 'completed' | 'failed';
		created_at: string;
		completed_at: string;
	};
}

type Updates = Partial<Pick<JobApplication, 'has_match' | 'has_write_materials'>>;

type FetchOpts = { silent?: boolean };

interface ApplicationsContextType {
	draftedApps: JobApplication[];
	readyApps: JobApplication[];
	sentApps: JobApplication[];
	loading: boolean;
	error: string;
	refetch: (opts?: FetchOpts) => Promise<void>;
	moveToReady: (jobId: string) => void;
	moveToSent: (jobId: string) => void;
	updateCompletionStatus: (jobId: string, updates: Updates) => void;
}

const ApplicationsContext = createContext<ApplicationsContextType | undefined>(undefined);

export const useApplications = () => {
	const context = useContext(ApplicationsContext);
	if (context === undefined) {
		throw new Error('useApplications must be used within a ApplicationsProvider');
	}
	return context;
};

export const ApplicationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [draftedApps, setDraftedApps] = useState<JobApplication[]>([]);
	const [readyApps, setReadyApps] = useState<JobApplication[]>([]);
	const [sentApps, setSentApps] = useState<JobApplication[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchApplications();
	}, []);

	const fetchApplications = async ({ silent = false }: FetchOpts = {}) => {
		try {
			if (!silent) {
				setLoading(true);
			}
			setError(null);

			const response = await supabase.functions.invoke('get-applications', { method: 'GET' });
			const applications = (response.data?.applications || []) as JobApplication[];

			const drafts = [];
			const ready = [];
			const sent = [];

			applications.forEach((app) => {
				if (app.launched) {
					sent.push(app);
				} else if (app.status === 'ready') {
					ready.push(app);
				} else {
					drafts.push(app);
				}
			});

			setDraftedApps(drafts);
			setReadyApps(ready);
			setSentApps(sent);
		} catch (err) {
			console.error('Failed to fetch application lifecycle data:', err);
			setError('Failed to fetch applications');
		} finally {
			setLoading(false);
		}
	};

	const moveToReady = (jobId: string) => {
		const draftedApp = draftedApps.find((app) => app.job_id === jobId);
		if (draftedApp) {
			const readyApp: JobApplication = {
				...draftedApp,
				status: 'ready',
				has_match: true,
				has_write_materials: true
			};

			setDraftedApps((prev) => prev.filter((app) => app.job_id !== jobId));
			setReadyApps((prev) => [...prev, readyApp]);
		}
	};

	const moveToSent = (jobId: string) => {
		const readyApp = readyApps.find((app) => app.job_id === jobId);
		if (readyApp) {
			const sentApp: JobApplication = {
				...readyApp,
				status: 'sent',
				launched: {
					status: 'in-progress',
					created_at: new Date().toISOString(),
					completed_at: null
				}
			};

			setReadyApps((prev) => prev.filter((app) => app.job_id !== jobId));
			setSentApps((prev) => [...prev, sentApp]);
		}
	};

	const updateCompletionStatus = (jobId: string, updates: Updates) => {
		// This function is no longer needed since we use backend status
		// Applications will be refetched from backend when needed
		console.log('updateCompletionStatus called but not implemented - using backend status');
	};

	const value = {
		draftedApps,
		readyApps,
		sentApps,
		loading,
		error,
		refetch: fetchApplications,
		moveToReady,
		moveToSent,
		updateCompletionStatus
	};

	return <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>;
};
