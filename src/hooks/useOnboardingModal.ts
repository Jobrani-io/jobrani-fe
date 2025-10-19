import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { onboardingService } from '@/services/onboardingService';
import { supabase } from '@/integrations/supabase/client';

export const useOnboardingModal = () => {
	const [showModal, setShowModal] = useState(false);
	const [isChecking, setIsChecking] = useState(true);
	const { user, session } = useAuth();

	useEffect(() => {
		if (!user || !session) {
			setIsChecking(false);
			setShowModal(false);
			return;
		}

		const checkOnboardingStatus = async () => {
			try {
				// First check localStorage
				const localStorageCompleted =
					localStorage.getItem('jobrani-onboarding-completed') === 'true';

				if (localStorageCompleted) {
					console.log('Onboarding already completed (localStorage)');
					setShowModal(false);
					setIsChecking(false);
					return;
				}

				// If localStorage doesn't have the flag, check the database
				const { data: profile, error } = await supabase
					.from('profiles')
					.select('onboarding_completed')
					.eq('user_id', user.id)
					.single();

				if (error) {
					console.error('Error checking onboarding status:', error);
					// If error, assume onboarding not completed and show modal
					setShowModal(true);
					setIsChecking(false);
					return;
				}

				if (profile?.onboarding_completed) {
					// Update localStorage to avoid future database calls
					localStorage.setItem('jobrani-onboarding-completed', 'true');
					setShowModal(false);
				} else {
					// Show onboarding modal
					setShowModal(true);
				}
			} catch (error) {
				console.error('Error in onboarding check:', error);
				// On error, show modal to be safe
				setShowModal(true);
			} finally {
				setIsChecking(false);
			}
		};

		// Small delay to ensure auth is fully initialized
		const timeoutId = setTimeout(checkOnboardingStatus, 100);

		return () => clearTimeout(timeoutId);
	}, [user, session]);

	const handleModalClose = () => {
		setShowModal(false);
		// Set localStorage flag to ensure modal doesn't reappear
		localStorage.setItem('jobrani-onboarding-completed', 'true');
	};

	return {
		showModal,
		isChecking,
		handleModalClose
	};
};
