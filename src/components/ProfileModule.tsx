import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
	Linkedin,
	Settings,
	User,
	Mail,
	CheckCircle,
	CreditCard,
	Crown,
	Star,
	Key,
	MessageSquare,
	HelpCircle,
	Shield
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SupportModal from './SupportModal';
import { jsonReq } from '@/lib/req';
import { ConnectLinkedIn } from './ConnectLinkedIn';

const GOOGLE_SCOPES = [
	'openid',
	'email',
	'profile',
	'https://www.googleapis.com/auth/gmail.readonly',
	'https://www.googleapis.com/auth/gmail.send'
];

const ProfileModule = () => {
	const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
	const [isGmailConnected, setIsGmailConnected] = useState(false);
	const [isGmailLoading, setIsGmailLoading] = useState(true);
	const [isLinkedInLoading, setIsLinkedInLoading] = useState(true);
	const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
	const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);

	const {
		subscription,
		usage,
		loading: subscriptionLoading,
		currentPlan,
		openCustomerPortal
	} = useSubscription();
	const { user } = useAuth();
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const [searchParams] = useSearchParams();

	useEffect(() => {
		handleGoogleOAuthCallback();
		checkConnections();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleGoogleOAuthCallback = async () => {
		if (!searchParams.get('google_attemped')) return;

		try {
			const {
				data: { session },
				error
			} = await supabase.auth.getSession();

			if (error) throw error;
			if (!session) throw new Error('no session found');

			const accessToken = session.provider_token;
			const refreshToken = session.provider_refresh_token;
			if (!accessToken) throw new Error('No access token found');

			const tokenInfo = await jsonReq(
				`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`
			);
			const grantedScopes = tokenInfo?.scope || '';
			const hasAllScopes = GOOGLE_SCOPES.every((scope) => grantedScopes.includes(scope));
			if (!hasAllScopes) throw new Error('Some scopes were not granted');

			const userId = tokenInfo?.user_id;
			const expiresIn = tokenInfo?.expires_in || 3600;
			const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

			await supabase
				.from('profiles')
				.update({
					google_user_id: userId,
					google_access_token: accessToken,
					google_refresh_token: refreshToken,
					google_expires_at: expiresAt,
					gmail_access: true
				})
				.eq('user_id', session.user.id);

			setIsGmailConnected(true);

			toast.success('Gmail connected successfully!');
		} catch (error) {
			console.log(error);
			toast.error('Failed to connect to Gmail');
		} finally {
			setIsGmailLoading(false);
			navigate(pathname, { replace: true });
		}
	};

	const checkConnections = async () => {
		try {
			const { data } = await supabase
				.from('profiles')
				.select('*')
				.eq('user_id', user.id)
				.single();
			setIsGmailConnected(!!data?.gmail_access);
			setIsLinkedInConnected(!!data?.linkedin_connected);
		} catch (error) {
			console.log(error);
		} finally {
			setIsGmailLoading(false);
			setIsLinkedInLoading(false);
		}
	};

	const connectGmail = async () => {
		try {
			setIsGmailLoading(true);

			const { data } = await supabase
				.from('profiles')
				.select('*')
				.eq('user_id', user.id)
				.single();

			if (data?.google_refresh_token) {
				const { error } = await supabase
					.from('profiles')
					.update({ gmail_access: true })
					.eq('user_id', user.id);

				if (error) throw error;

				setIsGmailConnected(true);
				toast.success('Gmail connected successfully!');
				return;
			}

			await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					scopes: GOOGLE_SCOPES.join(' '),
					queryParams: {
						access_type: 'offline',
						prompt: 'consent'
					},
					redirectTo: `${location.origin}/myaccount?google_attemped=1`
				}
			});
		} catch (error) {
			console.log(error);
			toast.success('Failed to connect Gmail');
		} finally {
			setIsGmailLoading(false);
		}
	};

	const disconnectGmail = async () => {
		setIsGmailLoading(true);
		try {
			const { error } = await supabase
				.from('profiles')
				.update({ gmail_access: false })
				.eq('user_id', user.id);

			if (error) throw error;
		} catch (error) {
			console.log(error);
		} finally {
			setIsGmailLoading(false);
			setIsGmailConnected(false);
			toast.success('Gmail disconnected');
		}
	};

	const connectLinkedIn = async (username: string, password: string) => {
		try {
			setIsLinkedInLoading(true);
			const { error } = await supabase
				.from('profiles')
				.update({
					linkedin_connected: true,
					linkedin_username: username,
					linkedin_password: password
				})
				.eq('user_id', user.id);

			if (error) throw error;

			setIsLinkedInConnected(true);
			return true;
		} catch (error) {
			console.log(error);
			toast.success('Failed to connect LinkedIn');
			return false;
		} finally {
			setIsLinkedInLoading(false);
		}
	};

	const disconnectLinkedIn = async () => {
		setIsLinkedInLoading(true);
		try {
			await supabase
				.from('profiles')
				.update({
					linkedin_connected: false,
					linkedin_username: null,
					linkedin_password: null
				})
				.eq('user_id', user.id);
		} catch (error) {
			console.log(error);
		} finally {
			setIsLinkedInLoading(false);
			setIsLinkedInConnected(false);
			toast.success('LinkedIn disconnected');
		}
	};

	const sendPasswordReset = async () => {
		if (!user?.email) {
			toast.error('No email address found');
			return;
		}

		try {
			const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
				redirectTo: `${window.location.origin}/reset-password`
			});

			if (error) {
				toast.error(error.message);
			} else {
				toast.success('Password reset email sent');
			}
		} catch (error) {
			toast.error('Failed to send password reset email');
		}
	};

	const getGmailButton = () => {
		if (isGmailLoading) {
			return (
				<Button variant="outline" size="sm" className="px-7">
					<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
				</Button>
			);
		}

		if (isGmailConnected) {
			return (
				<div className="flex items-center gap-2">
					<CheckCircle className="h-4 w-4 text-green-600" />
					<Button variant="outline" size="sm" onClick={disconnectGmail}>
						Disconnect
					</Button>
				</div>
			);
		}

		return (
			<Button size="sm" onClick={connectGmail} className="bg-red-500 hover:bg-red-600">
				Connect
			</Button>
		);
	};

	const getLinkedInButton = () => {
		if (isLinkedInLoading) {
			return (
				<Button variant="outline" size="sm" className="px-7">
					<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
				</Button>
			);
		}

		if (isLinkedInConnected) {
			return (
				<div className="flex items-center gap-2">
					<CheckCircle className="h-4 w-4 text-green-600" />
					<Button variant="outline" size="sm" onClick={disconnectLinkedIn}>
						Disconnect
					</Button>
				</div>
			);
		}

		return (
			<Button
				size="sm"
				onClick={() => setIsLinkedInModalOpen(true)}
				className="bg-[#0A66C2] hover:bg-[#0A66C2]/90">
				Connect
			</Button>
		);
	};

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center gap-3">
				<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
					<User className="h-5 w-5 text-primary" />
				</div>
				<div>
					<h1 className="text-2xl font-bold">Profile Settings</h1>
					<p className="text-muted-foreground">Manage your accounts, plan, and preferences</p>
				</div>
			</div>

			{/* 2x2 Grid Layout */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Quadrant 1: Link Your Accounts */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Shield className="h-5 w-5 text-primary" />
							Link Your Accounts
						</CardTitle>
						<CardDescription>
							Connect LinkedIn + Gmail to power Do It For Me automation.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div className="flex items-center justify-between p-3 border rounded-lg">
								<div className="flex items-center gap-3">
									<Linkedin className="h-5 w-5 text-[#0A66C2]" />
									<span className="font-medium">LinkedIn</span>
								</div>
								<ConnectLinkedIn
									open={isLinkedInModalOpen}
									onClose={() => setIsLinkedInModalOpen(false)}
									connect={connectLinkedIn}
								/>
								{getLinkedInButton()}
							</div>

							<div className="flex items-center justify-between p-3 border rounded-lg">
								<div className="flex items-center gap-3">
									<Mail className="h-5 w-5 text-red-500" />
									<span className="font-medium">Gmail</span>
								</div>
								{getGmailButton()}
							</div>
						</div>

						<div className="text-xs text-muted-foreground flex items-center gap-2">
							<Shield className="h-3 w-3" />
							Secure OAuth — we never store your passwords or emails.
						</div>
					</CardContent>
				</Card>

				{/* Quadrant 2: Plan & Usage */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CreditCard className="h-5 w-5 text-primary" />
							Plan & Usage
						</CardTitle>
						<CardDescription>Current plan and usage statistics.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{subscriptionLoading ? (
							<div className="text-sm text-muted-foreground">Loading...</div>
						) : (
							<>
								{/* Plan Info */}
								<div className="flex items-center justify-between p-3 border rounded-lg">
									<div className="flex items-center gap-3">
										{subscription?.plan_type === 'free' && (
											<CheckCircle className="h-5 w-5 text-muted-foreground" />
										)}
										{subscription?.plan_type === 'do_it_for_me' && (
											<Star className="h-5 w-5 text-primary" />
										)}
										{subscription?.plan_type === 'do_it_with_me' && (
											<Crown className="h-5 w-5 text-secondary" />
										)}
										<div>
											<p className="text-sm font-medium">
												{subscription?.plan_type === 'free' && 'Free Plan'}
												{subscription?.plan_type === 'do_it_yourself' &&
													'Do It Yourself'}
												{subscription?.plan_type === 'do_it_for_me' && 'Do It For Me'}
												{subscription?.plan_type === 'do_it_with_me' && 'Do It With Me'}
											</p>
											<p className="text-xs text-muted-foreground">
												{subscription?.current_period_end &&
													`Renews ${new Date(
														subscription.current_period_end
													).toLocaleDateString()}`}
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="text-sm font-medium">
											{`$${currentPlan?.amount}/${
												currentPlan?.interval === 'week' ? 'wk' : 'mo'
											}`}
										</p>
									</div>
								</div>

								{/* Usage Stats */}
								{usage && (
									<div className="grid grid-cols-2 gap-3">
										<div className="text-center p-3 border rounded-lg">
											<p className="text-2xl font-bold text-primary">
												{usage.jobs_searched || 0}
											</p>
											<p className="text-xs text-muted-foreground">Jobs Searched</p>
										</div>
										<div className="text-center p-3 border rounded-lg">
											<p className="text-2xl font-bold text-primary">
												{usage.prospects_found || 0}
											</p>
											<p className="text-xs text-muted-foreground">Prospects Found</p>
										</div>
										<div className="text-center p-3 border rounded-lg">
											<p className="text-2xl font-bold text-primary">
												{usage.messages_generated || 0}
											</p>
											<p className="text-xs text-muted-foreground">Messages Generated</p>
										</div>
										<div className="text-center p-3 border rounded-lg">
											<p className="text-2xl font-bold text-primary">
												{usage.outreach_sent || 0}
											</p>
											<p className="text-xs text-muted-foreground">Outreach Sent</p>
										</div>
									</div>
								)}

								{/* Action Buttons */}
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => navigate('/hub?tab=pay')}>
										{subscription?.plan_type === 'free' ? 'Upgrade Plan' : 'Change Plan'}
									</Button>
									{subscription?.plan_type !== 'free' && (
										<Button
											variant="outline"
											size="sm"
											onClick={async () => {
												try {
													await openCustomerPortal();
												} catch (error) {
													toast.error('Failed to open billing portal');
												}
											}}>
											Billing Settings
										</Button>
									)}
								</div>
							</>
						)}
					</CardContent>
				</Card>

				{/* Quadrant 3: Account Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Settings className="h-5 w-5 text-primary" />
							Account Settings
						</CardTitle>
						<CardDescription>Login method and security preferences.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Login Method */}
						<div className="flex items-center justify-between p-3 border rounded-lg">
							<div className="flex items-center gap-3">
								<div className="h-8 w-8 rounded bg-blue-500 flex items-center justify-center">
									<span className="text-white text-xs font-medium">G</span>
								</div>
								<div>
									<p className="text-sm font-medium">Email Account</p>
									<p className="text-xs text-muted-foreground">
										{user?.email || 'No email found'}
									</p>
								</div>
							</div>
						</div>

						{/* Actions */}
						<div className="space-y-3">
							<Button
								variant="outline"
								className="w-full justify-start"
								onClick={sendPasswordReset}>
								<Key className="h-4 w-4 mr-2" />
								Change Password
							</Button>

							<Button
								variant="outline"
								className="w-full justify-start"
								onClick={() => toast.info('Email preferences coming soon!')}>
								<Mail className="h-4 w-4 mr-2" />
								Update Email Preferences
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Quadrant 4: Support */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<MessageSquare className="h-5 w-5 text-primary" />
							Customer Support
						</CardTitle>
						<CardDescription>Need help? Average response: 24 hrs.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="text-center py-4">
							<HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
							<p className="text-sm text-muted-foreground mb-4">
								Having an issue or need assistance? Our support team is here to help.
							</p>

							<Button onClick={() => setIsSupportModalOpen(true)} className="w-full">
								<MessageSquare className="h-4 w-4 mr-2" />
								Submit Ticket
							</Button>
						</div>

						<div className="text-xs text-muted-foreground space-y-1">
							<p>• Response time: Within 24 hours</p>
							<p>• For urgent issues, include detailed steps</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Support Modal */}
			<SupportModal isOpen={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)} />
		</div>
	);
};

export default ProfileModule;
