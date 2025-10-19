import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TourStep {
	id: string;
	title: string;
	content: string;
	targetId: string;
	position: 'bottom' | 'top' | 'left' | 'right';
	nextAction?: {
		type: 'navigate';
		target: string;
	};
}

export const tourSteps: TourStep[] = [
	{
		id: 'prospect',
		title: 'Step 1 of 5',
		content:
			"Thanks for filling out your profile! We're pulling up some jobs for you — and even saved a few we think might be a fit. Scroll down to see them.",
		targetId: 'first-search-result|first-saved-prospect|saved-prospects-section',
		position: 'top',
		nextAction: { type: 'navigate', target: 'match' }
	},
	{
		id: 'match',
		title: 'Step 2 of 5',
		content:
			"We've identified hiring managers for your jobs! Check out these specific matches and approve the ones that look promising.",
		targetId: 'first-pending-match|first-approved-match|approved-jobs-section',
		position: 'top',
		nextAction: { type: 'navigate', target: 'write' }
	},
	{
		id: 'write',
		title: 'Step 3 of 5',
		content:
			"Here's your first message template! You can customize it or create your own messages to send to hiring managers.",
		targetId: 'first-generated-message|first-message-template|first-saved-message|module-write',
		position: 'top',
		nextAction: { type: 'navigate', target: 'design' }
	},
	{
		id: 'design',
		title: 'Step 4 of 5',
		content:
			'Need to update your resume, highlights, or outreach strategy? You can adjust everything here in Design.',
		targetId: 'personal-story-section',
		position: 'top',
		nextAction: { type: 'navigate', target: 'apply' }
	},
	{
		id: 'apply',
		title: 'Step 5 of 5',
		content:
			"Once you've finalized everything in Design through Write, come to Apply to launch your campaign and start reaching out.",
		targetId: 'first-ready-application|module-apply',
		position: 'top'
	}
];

export interface UseGuidedTourReturn {
	isActive: boolean;
	currentStep: TourStep | null;
	currentStepIndex: number;
	startTour: () => void;
	nextStep: () => void;
	skipTour: () => void;
	finishTour: () => void;
	syncWithActiveModule: (moduleId: string) => void;
}

export const useGuidedTour = (): UseGuidedTourReturn => {
	const [isActive, setIsActive] = useState(false);
	const [currentStepIndex, setCurrentStepIndex] = useState(0);

	const currentStep = isActive ? tourSteps[currentStepIndex] || null : null;

	const startTour = () => {
		// Check if tour was already completed
		const tourCompleted = localStorage.getItem('jobrani-guided-tour-completed');
		if (tourCompleted === 'true') {
			return;
		}

		setIsActive(true);
		setCurrentStepIndex(0);
		localStorage.setItem('jobrani-guided-tour-active', 'true');
	};

	const nextStep = () => {
		if (currentStepIndex < tourSteps.length - 1) {
			setCurrentStepIndex((prev) => prev + 1);
		} else {
			finishTour();
		}
	};

	const skipTour = () => {
		setIsActive(false);
		localStorage.setItem('jobrani-guided-tour-completed', 'true');
		localStorage.removeItem('jobrani-guided-tour-active');
	};

	const finishTour = () => {
		setIsActive(false);
		localStorage.setItem('jobrani-guided-tour-completed', 'true');
		localStorage.removeItem('jobrani-guided-tour-active');
	};

	const syncWithActiveModule = (moduleId: string) => {
		// Only sync if tour is active
		if (!isActive) return;

		// Map module IDs to tour step indices
		const moduleToStepMap: Record<string, number> = {
			prospect: 0,
			match: 1,
			write: 2,
			design: 3,
			apply: 4
		};

		const stepIndex = moduleToStepMap[moduleId];
		if (stepIndex !== undefined && stepIndex !== currentStepIndex) {
			setCurrentStepIndex(stepIndex);
			localStorage.setItem('jobrani-guided-tour-step', stepIndex.toString());
		}
	};

	// Check if tour should auto-start on mount
	useEffect(() => {
		const checkTourStatus = async () => {
			// Check from database instead of localStorage
			const {
				data: { user }
			} = await supabase.auth.getUser();
			if (!user) return;

			const { data: profile } = await supabase
				.from('profiles')
				.select('onboarding_completed')
				.eq('user_id', user.id)
				.single();

			const onboardingCompleted = profile?.onboarding_completed === true;
			const tourCompleted = localStorage.getItem('jobrani-guided-tour-completed') === 'true';
			const tourActive = localStorage.getItem('jobrani-guided-tour-active') === 'true';

			// Auto-start tour if onboarding is complete but tour hasn't been completed or started
			if (onboardingCompleted && !tourCompleted && !tourActive) {
				setTimeout(() => startTour(), 1000); // Small delay to ensure DOM is ready
			} else if (tourActive && !tourCompleted) {
				// Resume tour if it was active
				setIsActive(true);
			}
		};

		checkTourStatus();
	}, []);

	return {
		isActive,
		currentStep,
		currentStepIndex,
		startTour,
		nextStep,
		skipTour,
		finishTour,
		syncWithActiveModule
	};
};
