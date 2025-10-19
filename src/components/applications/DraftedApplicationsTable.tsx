import { ExternalLink, CheckCircle, XCircle, Play, FolderOpen } from 'lucide-react';
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
import { type JobApplication } from '@/contexts/ApplicationsContext';

interface DraftedApplicationsTableProps {
	applications: JobApplication[];
	onFinishApplication: (jobId: string) => void;
	onReviewMaterials: (application: JobApplication) => void;
}

const DraftedApplicationsTable = ({
	applications,
	onFinishApplication,
	onReviewMaterials
}: DraftedApplicationsTableProps) => {
	const getCompletionStatus = (app: JobApplication) => {
		const completed = [];
		const pending = [];

		// Match is always required
		if (app.has_match) completed.push('Match');
		else pending.push('Match');

		// Resume is required if Apply is selected in Design
		if (app.campaign.apply) {
			if (app.resume_id) completed.push('Resume');
			else pending.push('Resume');
		}

		// Write materials are required if LinkedIn/Email is selected in Design
		const needsWriteMaterials = app.campaign.connect || app.campaign.email;
		if (needsWriteMaterials) {
			if (app.has_write_materials) completed.push('Write');
			else pending.push('Write');
		}

		return { completed, pending };
	};

	const getNextStep = (app: JobApplication) => {
		if (!app.has_match) return 'Find hiring manager in Match module';
		if (app.campaign.apply && !app.resume_id) return 'Upload resume in Profile settings';
		const needsWriteMaterials = app.campaign.connect || app.campaign.email;
		if (needsWriteMaterials && !app.has_write_materials) return 'Generate materials in Write module';
		return 'Complete remaining steps';
	};

	const handleJobClick = (jobUrl?: string) => {
		if (jobUrl) {
			window.open(jobUrl, '_blank');
		}
	};

	const handleProspectClick = (linkedinUrl?: string) => {
		if (linkedinUrl) {
			window.open(linkedinUrl, '_blank');
		}
	};

	if (applications.length === 0) {
		return (
			<Card className="border shadow-card">
				<CardContent className="flex flex-col items-center justify-center py-12">
					<CheckCircle className="h-12 w-12 text-muted-foreground mb-3" />
					<p className="text-muted-foreground text-center">
						No drafted applications. All your applications are ready to launch!
					</p>
					<p className="text-sm text-muted-foreground mt-1 text-center">
						Save new job opportunities to get started with your application pipeline.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border shadow-card">
			<CardHeader>
				<CardTitle className="text-xl font-semibold">Drafted Applications</CardTitle>
				<p className="text-muted-foreground">
					Applications that need completion before they can be launched.
				</p>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Prospect</TableHead>
							<TableHead>Match</TableHead>
							<TableHead>Requirements</TableHead>
							<TableHead>Next Steps</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{applications.map((app) => {
							const { completed, pending } = getCompletionStatus(app);
							const nextStep = getNextStep(app);

							return (
								<TableRow key={app.id} className="group">
									<TableCell>
										<div className="space-y-1">
											<div
												className="font-medium hover:text-primary cursor-pointer flex items-center gap-1"
												onClick={() => handleJobClick(app.job_url)}>
												{app.job_title}
												<ExternalLink className="h-3 w-3" />
											</div>
											<div className="text-sm text-muted-foreground">
												{app.company_name}
											</div>
											{app.location && (
												<div className="text-xs text-muted-foreground">
													{app.location}
												</div>
											)}
											{app.posted_on && (
												<div className="text-xs text-muted-foreground">
													Posted {app.posted_on}
												</div>
											)}
										</div>
									</TableCell>
									<TableCell>
										{app.match_name ? (
											<div className="space-y-1">
												<div
													className="font-medium hover:text-primary cursor-pointer flex items-center gap-1 text-sm"
													onClick={() => handleProspectClick(app.match_linkedin_url)}>
													{app.match_name}
													<ExternalLink className="h-3 w-3" />
												</div>
												<div className="text-xs text-muted-foreground">
													{app.match_title}
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
												<Badge
													variant="secondary"
													className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200">
													<XCircle className="h-3 w-3 mr-1" />
													Needs Selection
												</Badge>
												<div className="text-xs text-muted-foreground">
													Go to Match module
												</div>
											</div>
										)}
									</TableCell>
									<TableCell>
										<div className="space-y-2">
											<div className="space-y-1">
												{/* Resume requirement - only show if Apply is selected */}
												{app.campaign.apply && (
													<Badge
														variant="secondary"
														className={`text-xs mr-1 ${
															app.resume_id
																? 'bg-green-50 text-green-700 border border-green-200'
																: 'bg-red-50 text-red-700 border border-red-200'
														}`}>
														{app.resume_id && (
															<CheckCircle className="h-3 w-3 mr-1" />
														)}
														{!app.resume_id && (
															<XCircle className="h-3 w-3 mr-1" />
														)}
														Resume
													</Badge>
												)}
												
												{/* Write materials requirement - only show if LinkedIn/Email is selected */}
												{(app.campaign.connect || app.campaign.email) && (
													<Badge
														variant="secondary"
														className={`text-xs mr-1 ${
															app.has_write_materials
																? 'bg-green-50 text-green-700 border border-green-200'
																: 'bg-red-50 text-red-700 border border-red-200'
														}`}>
														{app.has_write_materials && (
															<CheckCircle className="h-3 w-3 mr-1" />
														)}
														{!app.has_write_materials && (
															<XCircle className="h-3 w-3 mr-1" />
														)}
														Write Materials
													</Badge>
												)}
											</div>
											<Button
												variant="outline"
												size="sm"
												className="h-6 text-xs"
												onClick={() => onReviewMaterials(app)}>
												<FolderOpen className="h-3 w-3 mr-1" />
												Review Materials
											</Button>
										</div>
									</TableCell>
									<TableCell>
										<div className="space-y-2">
											<div className="text-sm text-muted-foreground">{nextStep}</div>
											<Button
												variant="default"
												size="sm"
												className="h-8"
												onClick={() => onFinishApplication(app.job_id)}>
												<Play className="h-3 w-3 mr-1" />
												Finish Application
											</Button>
										</div>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
};

export default DraftedApplicationsTable;
