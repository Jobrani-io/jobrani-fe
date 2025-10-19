import { useState } from 'react';
import { ExternalLink, CheckCircle, Send, FolderOpen, RotateCcw, XCircle, FileText, Linkedin, Mail, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import { type JobApplication } from '@/contexts/ApplicationsContext';

interface ReadyApplicationsTableProps {
	applications: JobApplication[];
	onApplyForMe: (application: JobApplication) => Promise<void>;
	onReviewMaterials: (application: JobApplication) => void;
}

const ReadyApplicationsTable = ({
	applications,
	onApplyForMe,
	onReviewMaterials
}: ReadyApplicationsTableProps) => {
	const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
	const [bannerDismissed, setBannerDismissed] = useState(false);

	const applyForMe = async (job: JobApplication) => {
		setApplyingJobId(job.job_id);
		await onApplyForMe(job);
		setApplyingJobId(null);
	};

	const formatWorkflowSequence = (workflow: string[] = []) => {
		const stepNames: Record<string, string> = {
			connect: 'Connect',
			apply: 'Apply',
			email: 'Email'
		};

		return workflow.map((step) => stepNames[step] || step).join(' → ');
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
					<Send className="h-12 w-12 text-muted-foreground mb-3" />
					<p className="text-muted-foreground text-center">
						No applications ready to launch yet.
					</p>
					<p className="text-sm text-muted-foreground mt-1 text-center">
						Complete your drafted applications to see them here.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border shadow-card">
			<CardHeader>
				<CardTitle className="text-xl font-semibold">Ready Applications</CardTitle>
				<p className="text-muted-foreground">
					Fully prepared applications ready to launch with one click.
				</p>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Prospect</TableHead>
							<TableHead>Match</TableHead>
							<TableHead>Materials</TableHead>
							<TableHead>Next Steps</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{applications.map((application, index) => (
							<TableRow
								key={application.id}
								className="group"
								id={index === 0 ? 'first-ready-application' : undefined}>
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
										{application.location && (
											<div className="text-xs text-muted-foreground">
												{application.location}
											</div>
										)}
										{application.posted_on && (
											<div className="text-xs text-muted-foreground">
												Posted {application.posted_on}
											</div>
										)}
										<Badge
											variant="secondary"
											className="text-xs bg-green-50 text-green-700 border border-green-200">
											<CheckCircle className="h-3 w-3 mr-1" />
											Complete
										</Badge>
									</div>
								</TableCell>
								<TableCell>
									<div className="space-y-1">
										<div
											className="font-medium hover:text-primary cursor-pointer flex items-center gap-1 text-sm"
											onClick={() =>
												handleProspectClick(application.match_linkedin_url)
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
								</TableCell>
								<TableCell>
									<div className="space-y-2">
										<div className="space-y-1">
											{/* Resume Badge */}
											{application.resume_id ? (
												<Badge
													variant="secondary"
													className="text-xs bg-green-50 text-green-700 border border-green-200 mr-1">
													Resume
												</Badge>
											) : (
												<Badge
													variant="secondary"
													className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 mr-1">
													Resume
												</Badge>
											)}
											
											{/* LinkedIn Badge */}
											{application.linkedin_connected ? (
												<Badge
													variant="secondary"
													className="text-xs bg-green-50 text-green-700 border border-green-200 mr-1">
													LinkedIn
												</Badge>
											) : (
												<Badge
													variant="secondary"
													className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 mr-1">
													LinkedIn
												</Badge>
											)}
											
											{/* Email Badge */}
											{application.gmail_connected ? (
												<Badge
													variant="secondary"
													className="text-xs bg-green-50 text-green-700 border border-green-200">
													Email
												</Badge>
											) : (
												<Badge
													variant="secondary"
													className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200">
													Email
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
									<div className="space-y-2">
										<Button
											variant="default"
											size="sm"
											className="h-8 w-full bg-gradient-to-r from-orange-500 to-blue-500 text-white border-0"
											onClick={() => applyForMe(application)}>
											{applyingJobId === application.job_id ? (
												<RotateCcw className="h-4 w-4 mr-2 animate-spin" />
											) : (
												<>
													<Send className="h-3 w-3 mr-1" />
													Apply For Me
												</>
											)}
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
			
			{applications.length > 0 && !bannerDismissed && (
				<div className="px-6 pb-6">
					<Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
						<AlertDescription className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
								<Mail className="h-4 w-4" />
								<span>These messages are optimized for email outreach. For LinkedIn connection requests, we'll use a shortened version of your approved message that fits their 300-character limit.</span>
								<Linkedin className="h-4 w-4 ml-1" />
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setBannerDismissed(true)}
								className="h-6 w-6 p-0 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
							>
								<X className="h-3 w-3" />
							</Button>
						</AlertDescription>
					</Alert>
				</div>
			)}
		</Card>
	);
};

export default ReadyApplicationsTable;
