import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Mail, Eye, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface BetaWaitlistToastProps {
	onDismiss: () => void;
	onJoinWaitlist: () => void;
}

export const BetaWaitlistToast = ({ onDismiss, onJoinWaitlist }: BetaWaitlistToastProps) => {
	const [isVisible, setIsVisible] = useState(false);
	const [isJoining, setIsJoining] = useState(false);
	const [email, setEmail] = useState('');
	const { user } = useAuth();

	useEffect(() => {
		// Show toast with animation after component mounts
		const timer = setTimeout(() => setIsVisible(true), 100);
		return () => clearTimeout(timer);
	}, []);

	const handleDismiss = () => {
		setIsVisible(false);
		setTimeout(onDismiss, 300); // Wait for animation to complete
	};

	const handleJoinWaitlist = async () => {
		console.log('BetaWaitlistToast: Attempting to join waitlist...');
		console.log('BetaWaitlistToast: Current user:', user?.id, user?.email);
		console.log('BetaWaitlistToast: Email input:', email);

		// Validate email if user is not authenticated
		if (!user && (!email || !email.includes('@'))) {
			console.warn('BetaWaitlistToast: Invalid email provided');
			toast({
				title: 'Invalid Email',
				description: 'Please enter a valid email address.',
				variant: 'destructive'
			});
			return;
		}

		setIsJoining(true);
		try {
			const waitlistEmail = user?.email || email;

			// Track beta waitlist clicks in localStorage only
			const currentCount = parseInt(localStorage.getItem('jobrani-beta-waitlist-clicks') || '0');
			const newCount = currentCount + 1;
			localStorage.setItem('jobrani-beta-waitlist-clicks', newCount.toString());
			localStorage.setItem('jobrani-beta-waitlist-joined', 'true');

			console.log(`Beta waitlist clicked ${newCount} times`);

			// Track with Meta Pixel if available
			if (window.fbq) {
				window.fbq('track', 'Lead', { content_name: 'Beta Waitlist' });
			}

			toast({
				title: 'Success!',
				description:
					"You've been added to the beta waitlist. We'll notify you when access is available."
			});

			setIsVisible(false);
			setTimeout(onJoinWaitlist, 300);
		} catch (error) {
			console.error('Beta waitlist signup error:', error);
			toast({
				title: 'Error',
				description: 'Something went wrong. Please try again.',
				variant: 'destructive'
			});
		} finally {
			setIsJoining(false);
		}
	};

	return (
		<div
			className={`fixed bottom-6 right-6 z-50 w-80 transition-all duration-300 ease-out ${
				isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
			}`}>
			<Card className="shadow-2xl border-2 relative">
				<Button
					variant="ghost"
					size="icon"
					className="absolute top-2 right-2 h-6 w-6 rounded-full hover:bg-muted"
					onClick={handleDismiss}>
					<X className="h-3 w-3" />
				</Button>

				<CardHeader className="pb-3">
					<div className="flex items-center space-x-3">
						<div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
							<Eye className="h-4 w-4 text-primary-foreground" />
						</div>
						<div>
							<CardTitle className="text-base">Platform Preview</CardTitle>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-3">
					<CardDescription className="text-sm">
						Take a look around! A few features are only available to beta users, so some
						buttons might not work just yet.
					</CardDescription>

					{!user && (
						<Input
							type="email"
							placeholder="Enter your email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="text-xs"
						/>
					)}

					<Button
						className="w-full text-xs"
						variant="hero"
						size="sm"
						onClick={handleJoinWaitlist}
						disabled={isJoining}>
						<Mail className="h-3 w-3 mr-2" />
						{isJoining ? 'Joining...' : 'Join Beta'}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
};
