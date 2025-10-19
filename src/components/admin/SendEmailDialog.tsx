import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LaunchedApplication } from '@/hooks/useLaunchedApplications';

interface SendEmailDialogProps {
	app: LaunchedApplication;
	onClose: () => void;
	sendEmail: (app: LaunchedApplication, email: Email) => Promise<boolean>;
}

export interface Email {
	recipient: string;
	subject: string;
	body: string;
}

export function SendEmailDialog({ app, onClose, sendEmail }: SendEmailDialogProps) {
	const [email, setEmail] = useState<Email>(null);
	const [isSending, setIsSending] = useState(false);

	const isOpen = Boolean(app);

	useEffect(() => {
		if (isOpen && !email) {
			// TODO: find email message and set actual subject
			const message = app?.messages?.[0];
			setEmail({
				recipient: app?.match_email,
				subject: '',
				body: message?.content
			});
		}
	}, [isOpen, app, email]);

	const handleClose = () => {
		setEmail(null);
		setIsSending(false);
		onClose();
	};

	const handleSend = async () => {
		setIsSending(true);

		const htmlBody = email.body
			.trim()
			.split(/\n{2,}/)
			.map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
			.join('');

		const success = await sendEmail(app, { ...email, body: htmlBody });

		setIsSending(false);
		if (success) handleClose();
	};

	const hasGmailAccess = app?.gmail_access;
	const isEmailValid = Boolean(
		email?.recipient?.trim() && email?.subject?.trim() && email?.body?.trim()
	);

	return (
		<Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && handleClose()}>
			<DialogContent className="max-w-xl overflow-y-scroll max-h-screen">
				{hasGmailAccess ? (
					<DialogHeader>
						<DialogTitle>Send Email</DialogTitle>
						<DialogDescription>Compose and send an email to the recipient.</DialogDescription>
					</DialogHeader>
				) : (
					<DialogHeader>
						<DialogTitle>Send Email (UNAVAILABLE)</DialogTitle>
						<DialogDescription>
							This user has not connected Gmail to their account.
						</DialogDescription>
					</DialogHeader>
				)}
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="recipient">Recipient</Label>
						<Input
							id="recipient"
							value={email?.recipient}
							onChange={(e) => setEmail((prev) => ({ ...prev, recipient: e.target.value }))}
							placeholder="user@domain.com"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="subject">Subject</Label>
						<Input
							id="subject"
							value={email?.subject}
							onChange={(e) => setEmail((prev) => ({ ...prev, subject: e.target.value }))}
							placeholder="Enter email subject"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="body">Message</Label>
						<Textarea
							id="body"
							value={email?.body}
							onChange={(e) => setEmail((prev) => ({ ...prev, body: e.target.value }))}
							placeholder="Enter your message"
							className="min-h-[180px] resize-none"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleSend}
						disabled={isSending || !isEmailValid || !hasGmailAccess}>
						{isSending ? (
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
						) : (
							'Send Email'
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
