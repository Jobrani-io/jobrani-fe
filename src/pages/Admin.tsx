import { useState } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import {
	Search,
	Users,
	Clock,
	CheckCircle,
	Linkedin,
	Mail,
	FileText,
	Eye,
	ExternalLink
} from 'lucide-react';
import ApplicationMaterialsReviewModal from '@/components/ApplicationMaterialsReviewModal';
import { type LaunchedApplication, useLaunchedApplications } from '@/hooks/useLaunchedApplications';
import ConnectMatchDialog from '@/components/admin/ConnectMatchDialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Email, SendEmailDialog } from '@/components/admin/SendEmailDialog';

const statusBadgeColors = {
	completed: 'green',
	'in-progress': 'yellow',
	failed: 'red'
};

export default function Admin() {
	const {
		applications,
		loading,
		error,
		updateApplicationStatus,
		updateApplicationNotes,
		updateApplicationWorkflowStep
	} = useLaunchedApplications();

	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [connectMatchApp, setConnectMatchApp] = useState<LaunchedApplication>(null);
	const [emailMatchApp, setEmailMatchApp] = useState<LaunchedApplication>(null);
	const [reviewMaterialApp, setReviewMaterialApp] = useState(null);

	const filteredApplications = applications.filter((app) => {
		const matchesSearch =
			app.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			app.match_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			app.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			app.job_title.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	const handleWorkflowCompletionChange = async (
		app: LaunchedApplication,
		key: string,
		completed: boolean
	) => {
		const updated = app.workflow_sequence?.map((step) =>
			step.key === key ? { ...step, completed } : step
		);
		await updateApplicationWorkflowStep(app.id, updated);
	};

	const handleLinkedInAction = (app: LaunchedApplication) => {
		setConnectMatchApp(app);
	};

	const sendEmail = async (app: LaunchedApplication, email: Email) => {
		try {
			const { error } = await supabase.functions.invoke('gmail-send', {
				body: JSON.stringify({
					...email,
					from_user_id: app.user_id
				})
			});
			if (error) throw error;

			toast.success('Email sent');
			return true;
		} catch (error) {
			console.error('Failed to send email:', error);
			toast.error('Failed to send email');
			return false;
		}
	};

	const openApplicationLink = (app: LaunchedApplication) => {
		if (app.job_url) {
			window.open(app.job_url, '_blank');
		} else {
			toast.error('No job URL available');
		}
	};

	const getWorkflowSteps = (app: LaunchedApplication) => {
		const stepMap = {
			connect: {
				icon: Linkedin,
				action: handleLinkedInAction,
				label: 'Connect',
				key: 'connect'
			},
			email: {
				icon: Mail,
				action: setEmailMatchApp,
				label: 'Email',
				key: 'email'
			},
			apply: {
				icon: FileText,
				action: openApplicationLink,
				label: 'Apply',
				key: 'apply'
			}
		};

		const STEPS_COUNT = 3;

		const emptyStep = (
			<TableCell>
				<div className="text-muted-foreground text-sm flex justify-center">–</div>
			</TableCell>
		);

		let steps = app.workflow_sequence.map(({ key, completed }) => {
			const step = stepMap[key];
			if (!step) return emptyStep;

			const Icon = step.icon;
			return (
				<TableCell key={key}>
					{
						<div className="flex items-center gap-2">
							<Checkbox
								checked={completed}
								onCheckedChange={(checked) =>
									handleWorkflowCompletionChange(app, key, checked as boolean)
								}
							/>
							<Button
								size="sm"
								variant="outline"
								onClick={() => step.action(app)}
								className="h-8 px-2 flex items-center gap-1">
								<Icon className="h-3 w-3" />
								{step.label}
							</Button>
						</div>
					}
				</TableCell>
			);
		});

		if (steps.length < STEPS_COUNT) {
			steps = steps.concat(Array(STEPS_COUNT - steps.length).fill(emptyStep));
		}

		return steps;
	};

	const getStatusBadgeProps = (status: string) => {
		switch (status) {
			case 'completed':
				return { variant: 'default', color: 'green' };
			case 'in-progress':
				return { variant: 'secondary', color: 'yellow' };
			case 'failed':
				return { variant: 'destructive', color: 'red' };
			default:
				return { variant: 'default', color: 'blue' };
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Data</h2>
					<p className="text-muted-foreground">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
						<p className="text-muted-foreground">
							Monitor user application workflows and completion status
						</p>
					</div>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Users className="h-4 w-4" />
							{applications.length} Total Applications
						</div>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Applications</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{applications.length}</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Completed</CardTitle>
							<CheckCircle className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{applications.filter((app) => app.status === 'completed').length}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">In Progress</CardTitle>
							<Clock className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{applications.filter((app) => app.status === 'in-progress').length}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Failed</CardTitle>
							<Clock className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{applications.filter((app) => app.status === 'failed').length}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Filters */}
				<Card>
					<CardContent className="pt-6">
						<div className="flex flex-col sm:flex-row gap-4">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
								<Input
									placeholder="Search by user email, prospect, company, or job title..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10"
								/>
							</div>
							<div className="flex gap-2">
								<Button
									variant={statusFilter === 'all' ? 'default' : 'outline'}
									size="sm"
									onClick={() => setStatusFilter('all')}>
									All
								</Button>
								<Button
									variant={statusFilter === 'in-progress' ? 'default' : 'outline'}
									size="sm"
									onClick={() => setStatusFilter('in-progress')}>
									In Progress
								</Button>
								<Button
									variant={statusFilter === 'completed' ? 'default' : 'outline'}
									size="sm"
									onClick={() => setStatusFilter('completed')}>
									Completed
								</Button>
								<Button
									variant={statusFilter === 'failed' ? 'default' : 'outline'}
									size="sm"
									onClick={() => setStatusFilter('failed')}>
									Failed
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Applications Table */}
				<Card>
					<CardHeader>
						<CardTitle>Application Workflows</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="rounded-md border">
							<ConnectMatchDialog
								app={connectMatchApp}
								onClose={() => setConnectMatchApp(null)}
							/>
							<SendEmailDialog
								app={emailMatchApp}
								onClose={() => setEmailMatchApp(null)}
								sendEmail={sendEmail}
							/>
							<Table className="table-auto">
								<TableHeader>
									<TableRow>
										<TableHead>User</TableHead>
										<TableHead className="min-w-28">Date Sent</TableHead>
										<TableHead>Prospect</TableHead>
										<TableHead className="min-w-32">Match</TableHead>
										<TableHead>Step 1</TableHead>
										<TableHead>Step 2</TableHead>
										<TableHead>Step 3</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Notes</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredApplications.map((app) => (
										<TableRow key={app.id}>
											<TableCell className="font-medium">
												{app.user_email || 'Unknown User'}
											</TableCell>
											<TableCell>
												{format(new Date(app.launched_at), 'MMM dd, yyyy')}
											</TableCell>
											<TableCell>
												<div>
													{app.job_url ? (
														<a
															href={app.job_url}
															target="_blank"
															rel="noopener noreferrer"
															className="font-medium text-primary hover:underline inline-flex items-center gap-1">
															{app.company_name} - {app.job_title}
															<ExternalLink className="h-3 w-3" />
														</a>
													) : (
														<div className="font-medium">
															{app.company_name} - {app.job_title}
														</div>
													)}
												</div>
											</TableCell>
											<TableCell>
												<div>
													{app.match_linkedin_url ? (
														<a
															href={app.match_linkedin_url}
															target="_blank"
															rel="noopener noreferrer"
															className="font-medium text-primary hover:underline inline-flex items-center gap-1">
															{app.match_name || 'N/A'}
															<ExternalLink className="h-3 w-3" />
														</a>
													) : (
														<div className="font-medium">
															{app.match_name || 'N/A'}
														</div>
													)}
													<div className="text-sm text-muted-foreground">
														{app.match_title || 'No title'}
													</div>
												</div>
											</TableCell>

											{getWorkflowSteps(app)}

											<TableCell>
												<Select
													value={app.status}
													onValueChange={(
														value: 'in-progress' | 'completed' | 'failed'
													) => updateApplicationStatus(app.id, value)}>
													<SelectTrigger className="w-32 text-sm py-1 px-2">
														<Badge
															variant="outline"
															className={`bg-${
																statusBadgeColors[app?.status]
															}-100 text-${statusBadgeColors[app?.status]}-800`}>
															<SelectValue />
														</Badge>

														{/* <SelectValue /> */}
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="in-progress">In Progress</SelectItem>
														<SelectItem value="completed">Completed</SelectItem>
														<SelectItem value="failed">Failed</SelectItem>
													</SelectContent>
												</Select>
											</TableCell>

											<TableCell>
												<Textarea
													value={app.notes || ''}
													onChange={(e) =>
														updateApplicationNotes(app.id, e.target.value, true)
													}
													onBlur={(e) =>
														updateApplicationNotes(app.id, e.target.value)
													}
													placeholder="Add notes..."
													className="min-h-[80px] w-52"
												/>
											</TableCell>

											<TableCell>
												<Button
													size="sm"
													variant="outline"
													onClick={() => setReviewMaterialApp(app)}
													className="h-8 px-3">
													<Eye className="h-3 w-3 mr-1" />
													View
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>

						{filteredApplications.length === 0 && (
							<div className="text-center py-8">
								<p className="text-muted-foreground">
									No applications found matching your criteria.
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Materials Review Modal */}

				<ApplicationMaterialsReviewModal
					app={reviewMaterialApp}
					onClose={() => setReviewMaterialApp(null)}
				/>
			</div>
		</div>
	);
}
