import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingFunnel, type FormData } from './onboarding/OnboardingFunnel';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import savedProspectsService from '@/services/savedProspectsService';
import { BackgroundProcessingIndicator } from './BackgroundProcessingIndicator';
import { onboardingService } from '@/services/onboardingService';

export const BetaAccessOverlay = () => {
	const [showOnboarding, setShowOnboarding] = useState(true);
	const navigate = useNavigate();

	const autoSaveFirstJobs = async (data: FormData) => {
		try {
			console.log('Starting auto-save of first 5 jobs based on onboarding preferences...');

			// Build search filters from onboarding data - prioritize first selected role
			const searchFilters = {
				jobTitles: data.desiredRoles.length > 0 ? [data.desiredRoles[0]] : [], // Use first role for focused results
				jobLocations:
					data.locationPreferences.cities.length > 0 ? data.locationPreferences.cities : [],
				isRemote: data.locationPreferences.remote,
				exactMode: false, // Use expanded mode for better results
				page: 1,
				limit: 10 // Only get first 10 jobs
			};

			// Add hybrid/onsite preferences to locations if specified
			if (data.locationPreferences.hybrid || data.locationPreferences.onsite) {
				// Add user's cities if they specified them
				if (data.locationPreferences.cities.length === 0) {
					// If no specific cities, add common locations as fallback
					searchFilters.jobLocations = [];
				}
			}

			console.log('Auto-save search filters:', searchFilters);

			// Call the search-prospects function
			const { data: searchResults, error } = await supabase.functions.invoke(
				'search-prospects',
				{
					body: searchFilters
				}
			);

			if (error) {
				console.error('Error searching for jobs during auto-save:', error);
				return;
			}

			const jobs = searchResults?.data || [];
			console.log(`Found ${jobs.length} jobs for auto-save`);

			if (jobs.length === 0) {
				console.log('No jobs found matching user preferences');
				return;
			}

			// Save first 5 jobs (or fewer if less than 5 found)
			const jobsToSave = jobs.slice(0, 5);
			// Get remaining jobs for unapproved display
			const remainingJobs = jobs.slice(5);
			let savedCount = 0;

			// Get current user for bulk insert
			const {
				data: { user }
			} = await supabase.auth.getUser();

			if (user) {
				// Prepare data for bulk insert
				const insertData = jobsToSave.map((job) => ({
					user_id: user.id,
					prospect_id: job.id,
					company: job.organization,
					job_title: job.title,
					location: job.locations_derived?.[0],
					posted_on: job.date_posted,
					url: job.url,
					company_url: job.company_url,
					job_description: job.job_description,
					employment_type: job.employment_type,
					is_remote: job.is_remote,
					raw: job.raw
				}));

				// Bulk insert
				const { error } = await supabase.from('saved_prospects').insert(insertData);

				if (error) {
					console.error('Bulk save failed:', error);
				} else {
					savedCount = jobsToSave.length;
					console.log(`Bulk saved ${savedCount} jobs successfully`);
				}

				// Store remaining jobs as unapproved prospects for display
				if (remainingJobs.length > 0) {
					localStorage.setItem('jobrani-unapproved-prospects', JSON.stringify(remainingJobs));
					console.log(`Stored ${remainingJobs.length} unapproved prospects for display`);
				}
			}

			if (savedCount > 0) {
				console.log(`Successfully auto-saved ${savedCount} jobs to user's library`);
				const totalCount = savedCount + remainingJobs.length;
				toast({
					title: 'Welcome to Jobrani!',
					description: `We found ${totalCount} job${
						totalCount > 1 ? 's' : ''
					} matching your preferences! ${savedCount} saved to your library and ${
						remainingJobs.length
					} ready to review.`,
					duration: 5000
				});

				// Trigger a refresh of saved prospects in the UI by dispatching a custom event
				window.dispatchEvent(new CustomEvent('jobrani-saved-prospects-updated'));
			}
		} catch (error) {
			console.error('Error during auto-save process:', error);
			// Don't show error toast for auto-save failures to avoid interrupting onboarding flow
		}
	};

	const handleOnboardingComplete = async (data: FormData) => {
		console.log('BetaAccessOverlay: Onboarding completed with data:', data);

		try {
			// Get current user
			const {
				data: { user }
			} = await supabase.auth.getUser();
			if (!user) {
				throw new Error('User not authenticated');
			}

			// Check if user has already had auto-save (to prevent duplicates)
			const { data: existingSaves } = await supabase
				.from('saved_prospects')
				.select('id')
				.eq('user_id', user.id)
				.limit(1);

			const isFirstTime = !existingSaves || existingSaves.length === 0;

			// Use unified onboarding service for consistent data storage
			await onboardingService.completeOnboarding(data);

			setShowOnboarding(false);

			// Auto-save first 5 jobs only if this is the user's first time completing onboarding
			if (isFirstTime && data.desiredRoles.length > 0) {
				// Run auto-save in background (don't block navigation)
				// This will populate the saved jobs with the first role they selected
				autoSaveFirstJobs(data).catch((error) => {
					console.error('Background auto-save failed:', error);
					// Don't show error to user since this is background operation
				});
			}

			// Redirect to hub with prospect tab to start tour
			navigate('/hub?tab=prospect');
		} catch (error) {
			console.error('Error completing onboarding:', error);
			// Error handling is done by the onboarding service
		}
	};

	if (showOnboarding) {
		return (
			<>
				<div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
					<div className="w-full max-w-lg">
						<OnboardingFunnel onComplete={handleOnboardingComplete} />
					</div>
				</div>
				<BackgroundProcessingIndicator />
			</>
		);
	}

	return (
		<>
			<BackgroundProcessingIndicator />
		</>
	);
};
