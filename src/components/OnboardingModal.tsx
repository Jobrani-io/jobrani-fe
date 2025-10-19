import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { OnboardingFunnel } from '@/components/onboarding/OnboardingFunnel';
import { onboardingService } from '@/services/onboardingService';
import type { FormData } from '@/components/onboarding/OnboardingFunnel';

interface OnboardingModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const OnboardingModal = ({ isOpen, onClose }: OnboardingModalProps) => {
	const [isCompleting, setIsCompleting] = useState(false);

	const handleOnboardingComplete = async (data: FormData) => {
		try {
			setIsCompleting(true);
			await onboardingService.completeOnboarding(data);
			onClose();
		} catch (error) {
			console.error('Failed to complete onboarding:', error);
		} finally {
			setIsCompleting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={() => {}} modal>
			<DialogContent
				className="max-w-2xl max-h-[90vh] overflow-y-auto p-0"
				onPointerDownOutside={(e) => e.preventDefault()}
				onEscapeKeyDown={(e) => e.preventDefault()}>
				<DialogHeader className="p-6 pb-0">
					<DialogTitle className="text-center text-2xl font-bold">
						Welcome to Jobrani!
					</DialogTitle>
					<p className="text-center text-muted-foreground mt-2">
						Let's set up your profile to get started
					</p>
				</DialogHeader>
				<div className="p-6 pt-0">
					<OnboardingFunnel onComplete={handleOnboardingComplete} />
				</div>
			</DialogContent>
		</Dialog>
	);
};
