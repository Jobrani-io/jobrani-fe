import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import type { UsageFeature } from '@/contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';

interface LimitReachedModalProps {
	feature: UsageFeature;
	onClose: () => void;
}

const featureAlias: Record<UsageFeature, string> = {
	jobs_searched: 'job search',
	prospects_found: 'prospect matches',
	messages_generated: 'message generation',
	outreach_sent: 'application'
};

export function LimitReachedModal({ feature, onClose }: LimitReachedModalProps) {
	const navigate = useNavigate();

	const handleUpgrade = () => {
		onClose();
		navigate('/hub?tab=pay');
	};

	return (
		<Dialog open={Boolean(feature)} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-xl">Limit Reached</DialogTitle>
					<DialogDescription className="text-sm pt-2">
						You've reached your weekly {featureAlias[feature]} limit. Upgrade to continue
						using this feature.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button className="w-full" onClick={handleUpgrade}>
						Upgrade
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
