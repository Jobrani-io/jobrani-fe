import { ExternalLink, FolderOpen, Calendar, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import { format } from 'date-fns';
import { type JobApplication } from '@/contexts/ApplicationsContext';

interface ApplicationsSentTableProps {
	applications: JobApplication[];
	onReviewMaterials: (application: JobApplication) => void;
}

const ApplicationsSentTable = ({ applications, onReviewMaterials }: ApplicationsSentTableProps) => {
	const getCampaignTypeColor = (type: JobApplication['campaign_type']) => {
		return type === 'self-apply'
			? 'bg-green-50 text-green-700 border border-green-200'
			: 'bg-gradient-to-r from-orange-500 to-blue-500 text-white border-0';
	};

	const getStatusColor = (app: JobApplication) => {
		switch (app.launched?.status) {
			case 'completed':
				return 'bg-green-50 text-green-700 border border-green-200';
			case 'in-progress':
				return 'bg-blue-50 text-blue-700 border border-blue-200';
			case 'failed':
				return 'bg-red-50 text-red-700 border border-red-200';
			default:
				return 'bg-gray-50 text-gray-700 border border-gray-200';
		}
	};

	const formatWorkflowSequence = (workflow: string[]) => {
		const stepNames: Record<string, string> = {
			connect: 'Connect',
			apply: 'Apply',
			email: 'Email'
		};

		return workflow.map((step) => stepNames[step] || step).join(' → ');
	};

	const formatDate = (dateString: string) => {
		try {
			return format(new Date(dateString), 'MMM d, yyyy');
		} catch {
			return dateString;
		}
	};

	const handleJobClick = (jobUrl?: string) => {
		if (jobUrl) {
			window.open(jobUrl, '_blank');
		}
	};

	const handleProspectClick = (prospectName?: string, companyName?: string) => {
		if (prospectName && companyName) {
			const searchQuery = `${prospectName} ${companyName} site:linkedin.com/in`;
			const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
			window.open(searchUrl, '_blank');
		}
	};

	if (applications.length === 0) {
		return (
			<Card className="border shadow-card">
				<CardContent className="flex flex-col items-center justify-center py-12">
					<CheckCircle className="h-12 w-12 text-muted-foreground mb-3" />
					<p className="text-muted-foreground text-center">No applications sent yet.</p>
					<p className="text-sm text-muted-foreground mt-1 text-center">
						Launch your ready applications to see them here.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border shadow-card">
			<CardHeader>
				<CardTitle className="text-xl font-semibold">Applications Sent</CardTitle>
				<p className="text-muted-foreground">
					Track your launched applications and their progress.
				</p>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Prospect</TableHead>
							<TableHead>Match</TableHead>
							<TableHead>Write</TableHead>
							<TableHead>Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{applications.map((application) => (
							<TableRow key={application.id} className="group">
								<TableCell>
									<div className="space-y-1">
										<div
											className="font-medium hover:text-primary cursor-pointer flex items-center gap-1"
											onClick={() => handleJobClick(application.job_url)}>
											{application.job_title}
											<ExternalLink className="h-3 w-3" />
										</div>
										<div className="text-sm text-muted-foreground">
											{application.company_name}
										</div>
										<Badge
											variant="secondary"
											className="text-xs bg-green-50 text-green-700 border border-green-200">
											<CheckCircle className="h-3 w-3 mr-1" />
											Complete
										</Badge>
									</div>
								</TableCell>
								<TableCell>
									{application.match_name ? (
										<div className="space-y-1">
											<div
												className="font-medium hover:text-primary cursor-pointer flex items-center gap-1 text-sm"
												onClick={() =>
													handleProspectClick(
														application.match_name,
														application.company_name
													)
												}>
												{application.match_name}
												<ExternalLink className="h-3 w-3" />
											</div>
											<div className="text-xs text-muted-foreground">
												{application.match_title}
											</div>
											<Badge
												variant="secondary"
												className="text-xs bg-green-50 text-green-700 border border-green-200">
												<CheckCircle className="h-3 w-3 mr-1" />
												Selected
											</Badge>
										</div>
									) : (
										<div className="space-y-1">
											<div className="text-sm text-muted-foreground">
												Direct Application
											</div>
											<Badge
												variant="secondary"
												className="text-xs bg-blue-50 text-blue-700 border border-blue-200">
												<CheckCircle className="h-3 w-3 mr-1" />
												No Contact
											</Badge>
										</div>
									)}
								</TableCell>
								<TableCell>
									<div className="space-y-2">
										<div className="space-y-1">
											{application.campaign.connect && (
												<Badge
													variant="secondary"
													className="text-xs bg-green-50 text-green-700 border border-green-200 mr-1">
													<CheckCircle className="h-3 w-3 mr-1" />
													LinkedIn Connection
												</Badge>
											)}
											{application.campaign.email && (
												<Badge
													variant="secondary"
													className="text-xs bg-green-50 text-green-700 border border-green-200 mr-1">
													<CheckCircle className="h-3 w-3 mr-1" />
													Email
												</Badge>
											)}
											{application.campaign.apply && (
												<Badge
													variant="secondary"
													className="text-xs bg-green-50 text-green-700 border border-green-200">
													<CheckCircle className="h-3 w-3 mr-1" />
													Application
												</Badge>
											)}
										</div>
										<Button
											variant="outline"
											size="sm"
											className="h-6 text-xs"
											onClick={() => onReviewMaterials(application)}>
											<FolderOpen className="h-3 w-3 mr-1" />
											Review Materials
										</Button>
									</div>
								</TableCell>
								<TableCell>
									<div className="space-y-1">
										<Badge
											variant="secondary"
											className={`text-xs ${getStatusColor(application)}`}>
											{application.launched?.status === 'completed' && (
												<CheckCircle className="h-3 w-3 mr-1" />
											)}
											{application.launched?.status === 'completed'
												? 'Completed'
												: application.launched?.status === 'in-progress'
												? 'In Progress'
												: application.launched?.status === 'failed'
												? 'Failed'
												: application.status}
										</Badge>
										<div className="flex items-center gap-1 text-xs text-muted-foreground">
											<Calendar className="h-3 w-3" />
											{application.launched?.completed_at
												? formatDate(application.launched?.completed_at)
												: formatDate(application.launched?.created_at)}
										</div>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
};

export default ApplicationsSentTable;
