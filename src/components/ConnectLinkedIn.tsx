import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from 'sonner';
import { Checkbox } from './ui/checkbox';

interface ConnectLinkedInProps {
	open: boolean;
	connect: (username: string, password: string) => Promise<boolean>;
	onClose: () => void;
}

export function ConnectLinkedIn({ open, onClose, connect }: ConnectLinkedInProps) {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [is2faDisabled, setIs2faDisabled] = useState(false);
	const [connecting, setConnecting] = useState(false);

	const handleClose = () => {
		setUsername('');
		setPassword('');
		setIs2faDisabled(false);
		onClose();
	};

	const handleConnection = async () => {
		setConnecting(true);
		const success = await connect(username.trim(), password.trim());
		setConnecting(false);
		if (success) handleClose();
	};

	const isSaveEnabled = username.trim() && password.trim() && is2faDisabled;

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
			<form>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Connect LinkedIn</DialogTitle>
						<DialogDescription className="text-sm pt-2">
							To connect LinkedIn, you'll need to disable 2FA on your account.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4">
						<div className="grid gap-3">
							<Label htmlFor="li-username">Username</Label>
							<Input
								id="li-username"
								name="username"
								value={username}
								onChange={(ev) => setUsername(ev.target.value)}
							/>
						</div>
						<div className="grid gap-3">
							<Label htmlFor="li-password">Password</Label>
							<Input
								id="li-password"
								name="password"
								value={password}
								type="password"
								onChange={(ev) => setPassword(ev.target.value)}
							/>
						</div>
						<div className="flex items-center gap-3">
							<Checkbox
								id="2fa-acknowledge"
								checked={is2faDisabled}
								onCheckedChange={(checked) => setIs2faDisabled(checked as boolean)}
							/>
							<Label htmlFor="2fa-acknowledge">
								I have disabled 2FA on my LinkedIn account
							</Label>
						</div>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">Cancel</Button>
						</DialogClose>
						<Button onClick={handleConnection} disabled={connecting || !isSaveEnabled}>
							{connecting ? (
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
							) : (
								'Save'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</form>
		</Dialog>
	);
}
