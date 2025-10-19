import { Dialog, DialogContent } from '@/components/ui/dialog';
import { type LaunchedApplication } from '@/hooks/useLaunchedApplications';
import { ExternalLink } from 'lucide-react';

interface ConnectMatchDialogProps {
	app: LaunchedApplication | null;
	onClose: () => void;
}

const ConnectMatchDialog: React.FC<ConnectMatchDialogProps> = ({
	app,
	onClose
}: ConnectMatchDialogProps) => {
	return (
		<Dialog open={Boolean(app)} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent className="max-w-xl overflow-y-scroll max-h-screen">
				<div className="py-2 px-4 border-b">
					<div className="flex items-start gap-4">
						<div className="flex-1 min-w-0">
							{app?.match_linkedin_url ? (
								<a
									href={app?.match_linkedin_url}
									target="_blank"
									rel="noopener noreferrer"
									className="font-medium text-primary hover:underline inline-flex items-center gap-1">
									<p className="font-semibold text-base text-foreground">
										{app?.match_name}
									</p>
									<ExternalLink className="h-3 w-3" />
								</a>
							) : (
								<p className="font-semibold text-base text-foreground mb-1">
									{app?.match_name}
								</p>
							)}
							<p className="text-sm text-muted-foreground mt-1">
								{app?.match_title} at {app?.company_name}
							</p>
						</div>
					</div>
				</div>

				{/* Message section */}
				<div className="py-1 px-4">
					<p className="font-medium text-foreground mb-2">Messages</p>
					<div className="flex flex-col items-center justify-between space-y-4">
						{app?.messages?.map((m) => (
							<p key={m.id} className="text-xs">
								{m.content}
							</p>
						))}
					</div>
				</div>

				<div className="py-2 px-4">
					<p className="font-medium text-foreground mb-2">Credentials</p>
					{app?.li_un && app?.li_pw ? (
						<div className="flex flex-col justify-between space-y-1">
							<p className="text-sm">
								<span className="font-medium">Username:</span> {app.li_un}
							</p>
							<p className="text-sm">
								<span className="font-medium">Password:</span> {app.li_pw}
							</p>
						</div>
					) : (
						<p className="text-sm">
							Credentials not available. This user has not connected their LinkedIn account.
						</p>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ConnectMatchDialog;
