import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import {
	MessageSquare,
	Mail,
	UserPlus,
	FileText,
	Download,
	FolderOpen,
	Edit3,
	Save,
	X
} from 'lucide-react';
import { useState } from 'react';
import { LaunchedApplication } from '@/hooks/useLaunchedApplications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { JobApplication } from '@/contexts/ApplicationsContext';

interface Message {
	type: string;
	content: string;
	sent_at: string;
}

interface MaterialsReviewModalProps {
	onClose: () => void;
	app: LaunchedApplication | JobApplication;
}

const ApplicationMaterialsReviewModal = ({ onClose, app }: MaterialsReviewModalProps) => {
	const [editingMessage, setEditingMessage] = useState<string | null>(null);
	const [editContent, setEditContent] = useState('');
	const [isDownloadingResume, setIsDownloadingResume] = useState(false);

	const handleEdit = (message: Message) => {
		setEditingMessage(message.type);
		setEditContent(message.content);
	};

	const handleCancel = () => {
		setEditingMessage(null);
		setEditContent('');
	};

	const getMessageIcon = (type: string) => {
		switch (type) {
			case 'connect':
				return <UserPlus className="h-4 w-4" />;
			case 'email':
				return <Mail className="h-4 w-4" />;
			default:
				return <MessageSquare className="h-4 w-4" />;
		}
	};

	const getMessageTypeLabel = (type: string) => {
		switch (type) {
			case 'connect':
				return 'LinkedIn Connect';
			case 'email':
				return 'Email';
			default:
				return type;
		}
	};

	const getMessageTypeBadgeColor = (type: string) => {
		switch (type) {
			case 'connect':
				return 'bg-blue-50 text-blue-700 border-blue-200';
			case 'email':
				return 'bg-green-50 text-green-700 border-green-200';
			default:
				return 'bg-gray-50 text-gray-700 border-gray-200';
		}
	};

	const handleDownload = async () => {
		try {
			if (app?.resume_filename) {
				setIsDownloadingResume(true);

				const { data, error } = await supabase.storage
					.from('resumes')
					.download(app.resume_filename);
				if (error) throw error;

				const url = URL.createObjectURL(data);
				const a = document.createElement('a');
				a.href = url;
				a.download = app.resume_filename;
				document.body.appendChild(a);
				a.click();
				a.remove();
				URL.revokeObjectURL(url);
			} else {
				toast.error('Resume not found');
			}
		} catch (err) {
			console.log(err);
			toast.error('Failed to download resume');
		} finally {
			setIsDownloadingResume(false);
		}
	};

	const hasMessages = app?.messages && app?.messages?.length > 0;
	const hasResume = app?.resume_id;

	return (
		<Dialog open={Boolean(app)} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<FolderOpen className="h-5 w-5" />
						Application Materials
					</DialogTitle>
					<p className="text-sm text-muted-foreground">
						{app?.job_title} at {app?.company_name}
					</p>
				</DialogHeader>

				<div className="space-y-6 mt-4">
					{/* Messages Section */}
					<div>
						<div className="flex items-center gap-2 mb-3">
							<MessageSquare className="h-4 w-4" />
							<h3 className="font-medium">Messages Sent</h3>
						</div>

						{!hasMessages ? (
							<div className="text-center py-6 text-muted-foreground text-sm">
								No messages sent for this application.
							</div>
						) : (
							<div className="space-y-3">
								{app?.messages?.map((message, index) => {
									const isEditing = editingMessage === message.type;
									const canEdit = message.type === 'connect' || message.type === 'email';

									return (
										<div key={index} className="border rounded-lg p-4 space-y-3">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													{getMessageIcon(message.type)}
													<Badge
														variant="outline"
														className={getMessageTypeBadgeColor(message.type)}>
														{getMessageTypeLabel(message.type)}
													</Badge>
												</div>
												<div className="flex items-center gap-2">
													<span className="text-xs text-muted-foreground">
														{app?.completed_at
															? `Completed: ${format(
																	new Date(app.completed_at),
																	'MMM d, yyyy h:mm a'
															  )}`
															: 'Not completed'}
													</span>
													{canEdit && !isEditing && (
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleEdit(message)}
															className="h-6 px-2">
															<Edit3 className="h-3 w-3" />
														</Button>
													)}
												</div>
											</div>

											{isEditing ? (
												<div className="space-y-2">
													<Textarea
														value={editContent}
														onChange={(e) => setEditContent(e.target.value)}
														className="min-h-[100px]"
													/>
													<div className="flex gap-2">
														<Button
															size="sm"
															onClick={() => handleSave(message.type)}
															className="flex items-center gap-1">
															<Save className="h-3 w-3" />
															Save
														</Button>
														<Button
															variant="outline"
															size="sm"
															onClick={handleCancel}
															className="flex items-center gap-1">
															<X className="h-3 w-3" />
															Cancel
														</Button>
													</div>
												</div>
											) : (
												<div className="text-sm bg-muted p-3 rounded-md">
													{message.content}
												</div>
											)}
										</div>
									);
								})}
							</div>
						)}
					</div>

					{/* Separator if both sections exist */}
					{hasMessages && hasResume && <Separator />}

					{/* Resume Section */}
					<div>
						<div className="flex items-center gap-2 mb-3">
							<FileText className="h-4 w-4" />
							<h3 className="font-medium">Resume Used</h3>
						</div>

						{!hasResume ? (
							<div className="text-center py-6 text-muted-foreground text-sm">
								No resume attached to this application.
							</div>
						) : (
							<div className="border rounded-lg p-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<FileText className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm font-medium">{app?.resume_filename}</span>
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={handleDownload}
										className="flex items-center gap-2 w-28">
										{isDownloadingResume ? (
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
										) : (
											<>
												<Download className="h-3 w-3" />
												Download
											</>
										)}
									</Button>
								</div>
							</div>
						)}
					</div>

					{/* Show message if no materials at all */}
					{!hasMessages && !hasResume && (
						<div className="text-center py-8">
							<FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
							<p className="text-muted-foreground">
								No materials available for this application.
							</p>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ApplicationMaterialsReviewModal;
