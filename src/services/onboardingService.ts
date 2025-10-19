import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { FormData } from '@/components/onboarding/OnboardingFunnel';
import { Json } from '@/integrations/supabase/types';

export interface OnboardingData {
	campaignStrategy: string[];
	mentionJobDirectly: boolean;
	desiredRoles: string[];
	locationPreferences: {
		remote: boolean;
		hybrid: boolean;
		onsite: boolean;
		cities: string[];
	};
	salaryRange: {
		min: number;
		max: number;
		currency: string;
	};
	industryPreferences: string[];
	resumeFile?: File | null;
	resumeHighlights?: string[];
	resumeId?: number | string;
}

class OnboardingService {
	private static instance: OnboardingService;

	static getInstance(): OnboardingService {
		if (!OnboardingService.instance) {
			OnboardingService.instance = new OnboardingService();
		}
		return OnboardingService.instance;
	}

	private constructor() {}

	async completeOnboarding(data: FormData): Promise<void> {
		console.log('OnboardingService: Completing onboarding with data:', data);

		try {
			const {
				data: { user },
				error: authError
			} = await supabase.auth.getUser();

			if (authError || !user) {
				console.error('OnboardingService: Authentication verification failed:', authError);
				throw new Error('Authentication required');
			}

			console.log('OnboardingService: Auth verified for user:', user.id);

			// Prepare onboarding data for database storage
			const onboardingDataForDb = {
				campaignStrategy: data.campaignStrategy || [],
				mentionJobDirectly: data.mentionJobDirectly || false,
				desiredRoles: data.desiredRoles || [],
				locationPreferences: data.locationPreferences || {
					remote: false,
					hybrid: false,
					onsite: false,
					cities: []
				},
				salaryRange: data.salaryRange || {
					min: 0,
					max: 0,
					currency: 'USD'
				},
				industryPreferences: data.industryPreferences || [],
				resumeId: data.resumeId || null
			};

			const profileData = {
				user_id: user.id,
				email: user.email || '',
				onboarding_data: onboardingDataForDb,
				onboarding_completed: true,
				updated_at: new Date().toISOString()
			};

			// Save to database
			const { error: dbError } = await supabase
				.from('profiles')
				.upsert(profileData, { onConflict: 'user_id' });

			if (dbError) {
				console.error('OnboardingService: Database error:', dbError);
				throw dbError;
			}

			console.log('OnboardingService: Successfully saved to database');

			// Prepare data for localStorage (includes file reference for UI)
			const localStorageData: OnboardingData = {
				campaignStrategy: onboardingDataForDb.campaignStrategy,
				mentionJobDirectly: onboardingDataForDb.mentionJobDirectly,
				desiredRoles: onboardingDataForDb.desiredRoles,
				locationPreferences: {
					remote: onboardingDataForDb.locationPreferences.remote,
					hybrid: onboardingDataForDb.locationPreferences.hybrid,
					onsite: onboardingDataForDb.locationPreferences.onsite,
					cities: onboardingDataForDb.locationPreferences.cities
				},
				salaryRange: {
					min: onboardingDataForDb.salaryRange.min,
					max: onboardingDataForDb.salaryRange.max,
					currency: onboardingDataForDb.salaryRange.currency
				},
				industryPreferences: onboardingDataForDb.industryPreferences,
				resumeFile: data.resumeFile || null,
				resumeHighlights: data.resumeHighlights || [],
				resumeId: onboardingDataForDb.resumeId
			};

			// Save to localStorage for immediate access
			localStorage.setItem('jobrani-onboarding-data', JSON.stringify(localStorageData));
			localStorage.setItem('jobrani-onboarding-completed', 'true');

			// Only clear tour state if user hasn't already completed or skipped it
			const tourCompleted = localStorage.getItem('jobrani-guided-tour-completed');
			if (tourCompleted !== 'true') {
				localStorage.removeItem('jobrani-guided-tour-active');
			}

			// Remove beta waitlist flags
			localStorage.removeItem('jobrani-show-waitlist-toast');

			toast({
				title: 'Setup Complete!',
				description: 'Your profile and preferences have been saved successfully.'
			});
		} catch (error) {
			console.error('OnboardingService: Error completing onboarding:', error);
			toast({
				title: 'Error',
				description: 'Failed to save your data. Please try again.',
				variant: 'destructive'
			});
			throw error;
		}
	}

	getOnboardingData(): OnboardingData | null {
		try {
			const data = localStorage.getItem('jobrani-onboarding-data');
			return data ? JSON.parse(data) : null;
		} catch (error) {
			console.warn('OnboardingService: Failed to parse onboarding data:', error);
			return null;
		}
	}

	isOnboardingCompleted(): boolean {
		return localStorage.getItem('jobrani-onboarding-completed') === 'true';
	}

	clearOnboardingData(): void {
		localStorage.removeItem('jobrani-onboarding-data');
		localStorage.removeItem('jobrani-onboarding-completed');
	}

	async loadProfileFromDatabase(): Promise<OnboardingData | null> {
		try {
			const {
				data: { user }
			} = await supabase.auth.getUser();
			if (!user) return null;

			// Get profile with onboarding_data
			const { data: profile, error } = await supabase
				.from('profiles')
				.select('onboarding_data, onboarding_completed')
				.eq('user_id', user.id)
				.single();

			if (error || !profile || !profile.onboarding_completed) return null;

			// Get resume highlights from user_resumes table
			const { data: resumeData } = await supabase
				.from('user_resumes')
				.select('highlights, id')
				.eq('user_id', user.id)
				.order('created_at', { ascending: false })
				.limit(1)
				.single();

			const onboardingData = profile.onboarding_data as unknown as OnboardingData | null;

			if (!onboardingData) return null;

			// Convert database format back to onboarding data format
			const result: OnboardingData = {
				campaignStrategy: onboardingData.campaignStrategy || [],
				mentionJobDirectly: onboardingData.mentionJobDirectly || false,
				desiredRoles: onboardingData.desiredRoles || [],
				locationPreferences: onboardingData.locationPreferences || {
					remote: false,
					hybrid: false,
					onsite: false,
					cities: []
				},
				salaryRange: onboardingData.salaryRange || {
					min: 0,
					max: 0,
					currency: 'USD'
				},
				industryPreferences: onboardingData.industryPreferences || [],
				resumeHighlights: resumeData?.highlights
					? resumeData.highlights.split('\n').filter((h) => h.trim())
					: [],
				resumeId: resumeData?.id || onboardingData.resumeId || undefined
			};

			return result;
		} catch (error) {
			console.warn('OnboardingService: Failed to load profile from database:', error);
			return null;
		}
	}

	async updateMentionJobDirectly(mentionJobDirectly: boolean): Promise<void> {
		try {
			const {
				data: { user },
				error: authError
			} = await supabase.auth.getUser();

			if (authError || !user) {
				console.error('OnboardingService: Authentication verification failed:', authError);
				throw new Error('Authentication required');
			}

			// Get current onboarding data from database
			const { data: profile, error: fetchError } = await supabase
				.from('profiles')
				.select('onboarding_data')
				.eq('user_id', user.id)
				.single();

			if (fetchError) {
				console.error('OnboardingService: Failed to fetch profile:', fetchError);
				throw fetchError;
			}

			// Update the mentionJobDirectly field
			const updatedOnboardingData = {
				...(profile.onboarding_data as any),
				mentionJobDirectly
			};

			// Update database
			const { error: updateError } = await supabase
				.from('profiles')
				.update({
					onboarding_data: updatedOnboardingData,
					updated_at: new Date().toISOString()
				})
				.eq('user_id', user.id);

			if (updateError) {
				console.error('OnboardingService: Database update error:', updateError);
				throw updateError;
			}

			console.log('OnboardingService: Successfully updated mentionJobDirectly in database');
		} catch (error) {
			console.error('OnboardingService: Error updating mentionJobDirectly:', error);
			throw error;
		}
	}

	async syncDatabaseToLocalStorage(): Promise<void> {
		try {
			console.log('OnboardingService: Syncing database data to localStorage');
			const profileData = await this.loadProfileFromDatabase();

			if (profileData) {
				// Update localStorage with database data
				localStorage.setItem('jobrani-onboarding-data', JSON.stringify(profileData));
				localStorage.setItem('jobrani-onboarding-completed', 'true');
			}
		} catch (error) {
			console.warn('OnboardingService: Failed to sync database to localStorage:', error);
		}
	}

	async updateOnboardingData({
		onboardingData,
		userId
	}: {
		onboardingData: OnboardingData;
		userId: string;
	}): Promise<void> {
		try {
			await supabase
				.from('profiles')
				.update({ onboarding_data: onboardingData as unknown as Json })
				.eq('user_id', userId)
				.single();
		} catch (error) {
			console.error('OnboardingService: Failed to update onboarding data:', error);
			throw error;
		}
	}
}

export const onboardingService = OnboardingService.getInstance();
