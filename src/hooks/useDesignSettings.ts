import { useState, useEffect } from 'react';
import { onboardingService } from '@/services/onboardingService';
import { useAuth } from '@/contexts/AuthContext';

type ActionType = 'connect' | 'apply' | 'email';

interface DesignSettings {
	selectedActions: ActionType[];
	useCustomOrder: boolean;
	actionOrder: ActionType[];
	mentionJobDirectly: boolean;
}

const DEFAULT_SETTINGS: DesignSettings = {
	selectedActions: [],
	useCustomOrder: false,
	actionOrder: ['apply', 'connect', 'email'],
	mentionJobDirectly: true
};

const STORAGE_KEY = 'jobrani-design-settings';

export const useDesignSettings = () => {
	const [settings, setSettings] = useState<DesignSettings>(DEFAULT_SETTINGS);
	const { user } = useAuth();

	// Load settings from localStorage and sync with onboarding data on mount
	useEffect(() => {
		const loadSettings = async () => {
			try {
				let finalSettings = { ...DEFAULT_SETTINGS };

				// First, try to load from localStorage
				const savedSettings = localStorage.getItem(STORAGE_KEY);
				if (savedSettings) {
					const parsed = JSON.parse(savedSettings);
					finalSettings = { ...DEFAULT_SETTINGS, ...parsed };
				}

				// Then, try to sync with onboarding data from database
				const profileData = await onboardingService.loadProfileFromDatabase();
				if (profileData && profileData.campaignStrategy) {
					// Map campaign strategy to selected actions
					const selectedActions = profileData.campaignStrategy.filter(
						(action): action is ActionType =>
							action === 'connect' || action === 'apply' || action === 'email'
					);

					if (selectedActions.length > 0) {
						finalSettings.selectedActions = selectedActions;
						finalSettings.mentionJobDirectly = profileData.mentionJobDirectly;

						// Save the synced settings
						localStorage.setItem(STORAGE_KEY, JSON.stringify(finalSettings));
					}
				} else {
					// Fallback to local storage onboarding data
					const onboardingData = onboardingService.getOnboardingData();
					if (onboardingData && onboardingData.campaignStrategy) {
						const selectedActions = onboardingData.campaignStrategy.filter(
							(action): action is ActionType =>
								action === 'connect' || action === 'apply' || action === 'email'
						);

						if (selectedActions.length > 0) {
							finalSettings.selectedActions = selectedActions;
							finalSettings.mentionJobDirectly = onboardingData.mentionJobDirectly;

							// Save the synced settings
							localStorage.setItem(STORAGE_KEY, JSON.stringify(finalSettings));
						}
					}
				}

				setSettings(finalSettings);
			} catch (error) {
				console.warn('Failed to load design settings:', error);
				setSettings(DEFAULT_SETTINGS);
			}
		};

		loadSettings();
	}, []);

	// Save settings to localStorage whenever they change
	const saveSettings = async (newSettings: DesignSettings) => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));

			setSettings(newSettings);
		} catch (error) {
			console.warn('Failed to save design settings to localStorage:', error);
			setSettings(newSettings); // Still update state even if localStorage fails
		}
	};

	const updateOnboardingData = async (newSettings: DesignSettings) => {
		const existingOnboardingData = onboardingService.getOnboardingData();
		if (!existingOnboardingData) return;

		await onboardingService.updateOnboardingData({
			onboardingData: {
				...existingOnboardingData,
				campaignStrategy: newSettings.selectedActions
			},
			userId: user?.id
		});
	};

	const updateSelectedActions = (selectedActions: ActionType[]) => {
		const newSettings = { ...settings, selectedActions };

		saveSettings(newSettings);

		updateOnboardingData(newSettings);

		// Also update onboarding data to keep them in sync
		const onboardingData = onboardingService.getOnboardingData();
		if (onboardingData) {
			const updatedOnboardingData = {
				...onboardingData,
				campaignStrategy: selectedActions
			};
			localStorage.setItem('jobrani-onboarding-data', JSON.stringify(updatedOnboardingData));
		}
	};

	const updateUseCustomOrder = (useCustomOrder: boolean) => {
		const newSettings = { ...settings, useCustomOrder };
		saveSettings(newSettings);
	};

	const updateActionOrder = (actionOrder: ActionType[]) => {
		const newSettings = { ...settings, actionOrder };
		saveSettings(newSettings);
	};

	const updateMentionJobDirectly = async (mentionJobDirectly: boolean) => {
		const newSettings = { ...settings, mentionJobDirectly };
		saveSettings(newSettings);

		// Also update onboarding data to keep them in sync
		const onboardingData = onboardingService.getOnboardingData();
		if (onboardingData) {
			const updatedOnboardingData = {
				...onboardingData,
				mentionJobDirectly
			};
			localStorage.setItem('jobrani-onboarding-data', JSON.stringify(updatedOnboardingData));
		}

		// Update database to persist the change
		try {
			await onboardingService.updateMentionJobDirectly(mentionJobDirectly);
		} catch (error) {
			console.warn('Failed to update mentionJobDirectly in database:', error);
			// Don't throw - local settings are still updated
		}
	};

	return {
		selectedActions: settings.selectedActions,
		useCustomOrder: settings.useCustomOrder,
		actionOrder: settings.actionOrder,
		mentionJobDirectly: settings.mentionJobDirectly,
		updateSelectedActions,
		updateUseCustomOrder,
		updateActionOrder,
		updateMentionJobDirectly
	};
};
