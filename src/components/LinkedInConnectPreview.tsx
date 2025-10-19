import { Crown, UserCheck, UserCog } from 'lucide-react';

interface MockProspect {
	id: string;
	firstName: string;
	lastName: string;
	company: string;
	jobTitle: string;
	industry: string;
	contactType: 'decision-maker' | 'recruiter' | 'peer';
	jobOpening: string;
}

interface LinkedInConnectPreviewProps {
	prospect: MockProspect;
	message: string;
	isGenerating?: boolean;
}

const LinkedInConnectPreview: React.FC<LinkedInConnectPreviewProps> = ({
	prospect,
	message,
	isGenerating = false
}) => {
	const getInitials = (firstName: string, lastName: string) => {
		return `${firstName[0]}${lastName[0]}`.toUpperCase();
	};

	const getContactIcon = (contactType: string) => {
		switch (contactType) {
			case 'decision-maker':
				return <Crown className="h-3 w-3" />;
			case 'recruiter':
				return <UserCheck className="h-3 w-3" />;
			case 'peer':
				return <UserCog className="h-3 w-3" />;
			default:
				return null;
		}
	};

	const getContactLabel = (contactType: string) => {
		switch (contactType) {
			case 'decision-maker':
				return 'Decision Maker';
			case 'recruiter':
				return 'Recruiter';
			case 'peer':
				return 'Peer';
			default:
				return '';
		}
	};

	return (
		<div className="bg-background border rounded-lg overflow-hidden shadow-sm">
			{/* LinkedIn-style header */}
			<div className="bg-[#0A66C2] px-4 py-3">
				<div className="flex items-center gap-3 text-white">
					<div className="text-sm font-medium">LinkedIn</div>
					<div className="text-xs opacity-90">Connect Request</div>
				</div>
			</div>

			{/* Profile section */}
			<div className="p-4 border-b">
				<div className="flex items-start gap-4">
					{/* Profile photo placeholder */}
					<div className="w-16 h-16 rounded-full bg-[#0A66C2] flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
						{getInitials(prospect.firstName, prospect.lastName)}
					</div>

					{/* Profile info */}
					<div className="flex-1 min-w-0">
						<h3 className="font-semibold text-base text-foreground mb-1">
							{prospect.firstName} {prospect.lastName}
						</h3>

						<p className="text-sm text-muted-foreground">
							{prospect.jobTitle} at {prospect.company}
						</p>
					</div>
				</div>
			</div>

			{/* Message section */}
			<div className="p-4">
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<label className="text-sm font-medium text-foreground">Your message</label>
						<span className="text-xs text-muted-foreground">
							{message.length}/300 characters
						</span>
					</div>

					{isGenerating ? (
						<div className="bg-muted/30 border border-dashed border-muted-foreground/30 rounded-lg p-4">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 bg-[#0A66C2] rounded-full animate-pulse"></div>
								<span className="text-sm text-muted-foreground">
									Generating personalized message...
								</span>
							</div>
						</div>
					) : (
						<div className="bg-muted/10 border border-muted-foreground/20 rounded-lg p-4">
							<p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
								{message}
							</p>
						</div>
					)}

					{/* Regarding job opening */}
					{prospect.jobOpening && (
						<div className="text-xs text-muted-foreground bg-muted/20 rounded px-3 py-2">
							<span className="font-medium">Regarding:</span> {prospect.jobOpening} at{' '}
							{prospect.company}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default LinkedInConnectPreview;
