import { useState, useEffect } from 'react';
import { ProfileData, defaultProfileData, PersonalHighlight } from '@/types/profileData';
import { supabase } from '@/integrations/supabase/client';
import { resumeProcessingService } from '@/services/resumeProcessingService';
import { onboardingService } from '@/services/onboardingService';
import { useAuth } from '@/contexts/AuthContext';

const STORAGE_KEY = 'jobrani-profile-data';
const ONBOARDING_KEY = 'jobrani-onboarding-data';

// Onboarding data structure for migration
interface OnboardingData {
	jobSearchMindset?: string;
	jobSearchMindsetCustom?: string;
	desiredRoles: string[];
	locationPreferences: {
		remote: boolean;
		hybrid: boolean;
		onsite: boolean;
		cities: string[];
	};
	salaryRange?: {
		min: number;
		max: number;
		currency: string;
	};
	industryPreferences: string[];
	resumeHighlights?: string[];
	resumeId?: number | string;
}

// Load resume highlights from Supabase user_resumes table
const loadResumeHighlightsFromDatabase = async (): Promise<PersonalHighlight[]> => {
	try {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) return [];

		// Get highlights from user_resumes table
		const { data: resumes } = await supabase
			.from('user_resumes')
			.select('highlights, id')
			.eq('user_id', user.id)
			.order('created_at', { ascending: false })
			.limit(1);

		if (resumes && resumes.length > 0 && resumes[0].highlights) {
			const highlightsText = resumes[0].highlights;
			const highlightsArray = highlightsText.split('\n').filter((h: string) => h.trim());

			return highlightsArray.map((highlight: string, index: number) => ({
				id: `db-resume-${resumes[0].id}-${index}`,
				text: highlight.trim(),
				category: 'experience' as const,
				isFromResume: true,
				isLocked: false,
				order: index
			}));
		}
	} catch (error) {
		console.warn('Failed to load resume highlights from database:', error);
	}

	return [];
};

// Convert onboarding data to profile data format
const migrateOnboardingData = (onboardingData: OnboardingData): ProfileData => {
	const personalHighlights: PersonalHighlight[] = (onboardingData.resumeHighlights || []).map(
		(highlight, index) => ({
			id: `migrated-${index}`,
			text: highlight,
			category: 'experience' as const,
			isFromResume: true,
			isLocked: false,
			order: index
		})
	);

	return {
		...defaultProfileData,
		desiredRoles: onboardingData.desiredRoles || [],
		locationPreferences:
			onboardingData.locationPreferences || defaultProfileData.locationPreferences,
		industryPreferences: onboardingData.industryPreferences || [],
		salaryRange: onboardingData.salaryRange,
		personalHighlights,
		resumeId: onboardingData.resumeId?.toString()
	};
};

export const useProfileData = () => {
	const { user } = useAuth();
	const [profileData, setProfileData] = useState<ProfileData>(defaultProfileData);

	// Load profile data from localStorage and database on mount
	useEffect(() => {
		const loadProfileData = async () => {
			try {
				// First, sync database data to localStorage
				await onboardingService.syncDatabaseToLocalStorage();

				const savedProfile = localStorage.getItem(STORAGE_KEY);
				const savedOnboarding = localStorage.getItem(ONBOARDING_KEY);

				let baseProfileData = defaultProfileData;

				if (savedProfile) {
					// Profile data exists, use it as base
					const parsed = JSON.parse(savedProfile);
					baseProfileData = { ...defaultProfileData, ...parsed };
				} else if (savedOnboarding) {
					// No profile data but onboarding data exists - migrate it
					const onboardingData = JSON.parse(savedOnboarding);
					baseProfileData = migrateOnboardingData(onboardingData);

					// Save the migrated data to profile storage
					localStorage.setItem(STORAGE_KEY, JSON.stringify(baseProfileData));
				}

				// Try to load additional resume highlights from database
				const dbHighlights = await loadResumeHighlightsFromDatabase();
				if (dbHighlights.length > 0) {
					// Merge with existing highlights, avoiding duplicates
					const existingTexts = new Set(baseProfileData.personalHighlights.map((h) => h.text));
					const newHighlights = dbHighlights.filter((h) => !existingTexts.has(h.text));

					if (newHighlights.length > 0) {
						baseProfileData = {
							...baseProfileData,
							personalHighlights: [...baseProfileData.personalHighlights, ...newHighlights]
						};
					}
				}

				setProfileData(baseProfileData);
			} catch (error) {
				console.warn('Failed to load profile data:', error);
				setProfileData(defaultProfileData);
			}
		};

		loadProfileData();
	}, []);

	// Subscribe to resume processing updates
	useEffect(() => {
		const unsubscribe = resumeProcessingService.subscribe((status) => {
			if (status.status === 'completed' && status.highlights && status.resumeId) {
				// Update profile with new resume data
				const currentHighlights = profileData.personalHighlights;
				const lockedHighlights = currentHighlights.filter((h) => h.isLocked || !h.isFromResume);

				const newHighlights: PersonalHighlight[] = status.highlights.map(
					(text: string, index: number) => ({
						id: `resume_${status.resumeId}_${index}`,
						text: text.trim(),
						category: 'experience' as const,
						isFromResume: true,
						isLocked: false,
						order: lockedHighlights.length + index
					})
				);

				const updatedProfile = {
					...profileData,
					resumeId: status.resumeId?.toString(),
					personalHighlights: [...lockedHighlights, ...newHighlights]
				};

				setProfileData(updatedProfile);
				localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
			}
		});

		return unsubscribe;
	}, [profileData]);

	// Save profile data to localStorage whenever it changes
	const updateProfile = async (newData: Partial<ProfileData>) => {
		const updatedProfile = { ...profileData, ...newData };
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
			setProfileData(updatedProfile);

			// Also update onboarding data if it exists for consistency
			const onboardingData = onboardingService.getOnboardingData();
			if (onboardingData) {
				const updatedOnboardingData = {
					...onboardingData,
					desiredRoles: updatedProfile.desiredRoles || onboardingData.desiredRoles,
					locationPreferences:
						updatedProfile.locationPreferences || onboardingData.locationPreferences,
					industryPreferences:
						updatedProfile.industryPreferences || onboardingData.industryPreferences,
					salaryRange: updatedProfile.salaryRange || onboardingData.salaryRange,
					resumeHighlights:
						updatedProfile.personalHighlights
							.filter((h) => h.isFromResume)
							.map((h) => h.text) || onboardingData.resumeHighlights,
					resumeId: updatedProfile.resumeId || onboardingData.resumeId
				};

				const { resumeFile, ...restOnboardingData } = updatedOnboardingData;
				await supabase
					.from('profiles')
					.update({ onboarding_data: restOnboardingData })
					.eq('user_id', user.id);

				localStorage.setItem(ONBOARDING_KEY, JSON.stringify(updatedOnboardingData));
			}
		} catch (error) {
			console.warn('Failed to save profile data to localStorage:', error);
			setProfileData(updatedProfile); // Still update state even if localStorage fails
		}
	};

	const resetProfile = () => {
		try {
			localStorage.removeItem(STORAGE_KEY);
			localStorage.removeItem(ONBOARDING_KEY);
			setProfileData(defaultProfileData);
		} catch (error) {
			console.warn('Failed to reset profile data in localStorage:', error);
			setProfileData(defaultProfileData);
		}
	};

	// Sync profile data to database
	const syncToDatabase = async () => {
		try {
			const {
				data: { user }
			} = await supabase.auth.getUser();
			if (!user) return;

			const profileDataForDb = {
				user_id: user.id,
				email: user.email || '',
				desired_roles: profileData.desiredRoles
					? JSON.stringify(profileData.desiredRoles)
					: null,
				location_preferences: profileData.locationPreferences
					? JSON.stringify(profileData.locationPreferences)
					: null,
				industry_preferences: profileData.industryPreferences
					? JSON.stringify(profileData.industryPreferences)
					: null,
				salary_range: profileData.salaryRange ? JSON.stringify(profileData.salaryRange) : null,
				resume_info:
					profileData.personalHighlights.filter((h) => h.isFromResume).length > 0
						? {
								highlights: profileData.personalHighlights
									.filter((h) => h.isFromResume)
									.map((h) => h.text),
								resumeId: profileData.resumeId || null
						  }
						: null,
				updated_at: new Date().toISOString()
			};

			const { error } = await supabase
				.from('profiles')
				.upsert(profileDataForDb, { onConflict: 'user_id' });

			if (error) {
				console.warn('Failed to sync profile data to database:', error);
			} else {
				console.log('Profile data synced to database successfully');
			}
		} catch (error) {
			console.warn('Failed to sync profile data to database:', error);
		}
	};

	return {
		profileData,
		updateProfile,
		resetProfile,
		syncToDatabase
	};
};
