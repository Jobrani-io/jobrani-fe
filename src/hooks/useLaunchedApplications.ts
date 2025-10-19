import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LaunchedApplication {
	id: string;
	user_id: string;
	user_email: string;
	prospect_id: string;
	match_id: string;
	job_title: string;
	company_name: string;
	match_name: string;
	match_title: string;
	match_email?: string;
	match_linkedin_url?: string;
	job_url: string;
	workflow_sequence: Array<{
		key: string;
		completed?: boolean;
	}>;
	campaign_type: 'self-apply' | 'apply-for-me';
	status: 'in-progress' | 'completed' | 'failed';
	messages: Array<{
		id: string;
		content: string;
	}>;
	resume_id: string;
	resume_filename: string;
	notes?: string;
	gmail_access: boolean;
	li_un?: string;
	li_pw?: string;
	launched_at: string;
	completed_at?: string;
}

export const useLaunchedApplications = () => {
	const [applications, setApplications] = useState<LaunchedApplication[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchApplications();
	}, []);

	const fetchApplications = async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await supabase.functions.invoke('launched-applications', {
				method: 'GET'
			});
			const apps = (response.data?.applications || []) as LaunchedApplication[];
			setApplications(apps);
		} catch (err) {
			console.log(err);
			setError('Failed to fetch applications');
		} finally {
			setLoading(false);
		}
	};

	const updateApplicationStatus = async (id: string, status: LaunchedApplication['status']) => {
		try {
			const { error } = await supabase.functions.invoke('launched-applications', {
				method: 'PATCH',
				body: JSON.stringify({
					id,
					status,
					completed_at: status === 'completed' ? new Date().toISOString() : null
				})
			});

			if (error) throw error;

			setApplications((prev) =>
				prev.map((app) =>
					app.id === id
						? {
								...app,
								status,
								completed_at: status === 'completed' ? new Date().toISOString() : undefined
						  }
						: app
				)
			);
		} catch (err) {
			console.error('Failed to update application status:', err);
			toast.error('Failed to update application status');
		}
	};

	const updateApplicationNotes = async (id: string, notes: string, localOnly: boolean = false) => {
		const prevApplications = applications;
		try {
			setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, notes } : app)));
			if (localOnly) return;

			const { error } = await supabase.functions.invoke('launched-applications', {
				method: 'PATCH',
				body: JSON.stringify({ id, notes })
			});

			if (error) throw error;
		} catch (err) {
			console.error('Failed to update application notes:', err);
			toast.error('Failed to update application notes');
			setApplications(prevApplications);
		}
	};

	const updateApplicationWorkflowStep = async (
		id: string,
		workflow: LaunchedApplication['workflow_sequence']
	) => {
		const prevApplications = applications;
		try {
			setApplications((prev) =>
				prev.map((app) => (app.id === id ? { ...app, workflow_sequence: workflow } : app))
			);

			const { error } = await supabase.functions.invoke('launched-applications', {
				method: 'PATCH',
				body: JSON.stringify({ id, workflow_sequence: workflow })
			});

			if (error) throw error;
		} catch (err) {
			console.error('Failed to update application notes:', err);
			toast.error('Failed to update application notes');
			setApplications(prevApplications);
		}
	};

	return {
		applications,
		loading,
		error,
		refetch: fetchApplications,
		updateApplicationStatus,
		updateApplicationNotes,
		updateApplicationWorkflowStep
	};
};
