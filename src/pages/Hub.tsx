import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import ProspectModule from '@/components/ProspectModule';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import challengeInferenceService from '@/services/challengeInferenceService';
import {
	Bell,
	Brain,
	CheckCircle,
	CreditCard,
	LogOut,
	Rocket,
	Target,
	User,
	UserCheck,
	Zap
} from 'lucide-react';

import { BackgroundProcessingIndicator } from '@/components/BackgroundProcessingIndicator';
import CreateModule from '@/components/CreateModule';
import { GuidedTour } from '@/components/GuidedTour';
import MatchModule from '@/components/MatchModule';
import PayModule from '@/components/PayModule';
import DesignModule from '@/components/DesignModule';
import TrackModule from '@/components/TrackModule';
import LaunchModule from '@/components/LaunchModule';

const coreNavigationItems = [
	{
		id: 'design',
		icon: Zap,
		label: 'Design',
		description: 'Plan your outreach',
		badge: null
	},
	{
		id: 'prospect',
		icon: Target,
		label: 'Prospect',
		description: 'Find and add prospects',
		badge: null
	},
	{
		id: 'match',
		icon: UserCheck,
		label: 'Match',
		description: 'Assign contacts to jobs',
		badge: null
	},
	{
		id: 'write',
		icon: Brain,
		label: 'Write',
		description: 'Create content',
		badge: null
	},
	{
		id: 'apply',
		icon: Rocket,
		label: 'Apply',
		description: 'Submit applications',
		badge: null
	},
	// {
	//   id: "track",
	//   icon: CheckCircle,
	//   label: "Track",
	//   description: "Analytics & list management",
	//   badge: null,
	// },
	{
		id: 'pay',
		icon: CreditCard,
		label: 'Pay',
		description: 'Subscription & billing',
		badge: null
	}
];

const utilityNavigationItems = [
	// {
	//   id: "notifications",
	//   icon: Bell,
	//   label: "Notifications",
	//   description: "Updates & alerts",
	//   badge: 6,
	// },
];

const allNavigationItems = [...coreNavigationItems, ...utilityNavigationItems];

const Hub = () => {
	const [activeItem, setActiveItem] = useState('design');
	const [previewMode] = useState(true);
	const { user, signOut } = useAuth();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	const handleTabChange = (tabId: string) => {
		// Check if we're leaving the prospect module
		if (activeItem === 'prospect' && tabId === 'match') {
			console.log('Leaving prospect module, running challenge inference agent...');
			// Run challenge identifier in the background
			challengeInferenceService.runChallengeIdentifierForSavedJobs().catch((error) => {
				console.error('Failed to run challenge identifier:', error);
			});
		}

		setActiveItem(tabId);
		setSearchParams({ tab: tabId });
	};

	useEffect(() => {
		// Handle URL parameters for tab switching
		const tab = searchParams.get('tab');
		if (tab && coreNavigationItems.some((item) => item.id === tab)) {
			setActiveItem(tab);
		}
	}, [searchParams]);

	return (
		<div className="h-screen bg-background flex overflow-hidden">
			{/* Left Sidebar */}
			<div className="relative bg-card border-r border-border flex flex-col w-20">
				{/* Header */}
				<div className="h-[80px] border-b border-border flex items-center justify-center p-0.5">
					<img
						src="/lovable-uploads/7a778747-db11-4bc7-87a1-348a5abafb62.png"
						alt="Jobrani Logo"
						className="h-[75px] w-auto object-contain"
					/>
				</div>

				{/* Core Navigation Items */}
				<nav className="flex-1 p-2 space-y-1">
					{coreNavigationItems.map((item) => {
						const Icon = item.icon;
						const isActive = activeItem === item.id;

						return (
							<button
								key={item.id}
								id={`nav-${item.id}`}
								onClick={() => handleTabChange(item.id)}
								className={`w-full flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 group relative ${
									isActive
										? 'bg-primary text-primary-foreground shadow-sm'
										: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
								} py-2`}>
								<div className="relative mb-1">
									<Icon
										className={`h-5 w-5 transition-transform group-hover:scale-110 ${
											isActive ? 'text-primary-foreground' : ''
										}`}
									/>
									{item.badge && (
										<Badge
											variant="destructive"
											className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center">
											{item.badge}
										</Badge>
									)}
								</div>

								<div className="text-center min-w-0 w-full">
									<div
										className={`font-medium text-xs ${
											isActive ? 'text-primary-foreground' : ''
										}`}>
										{item.label}
									</div>
								</div>

								{/* Active indicator */}
								{isActive && (
									<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-r-full" />
								)}
							</button>
						);
					})}
				</nav>

				{/* Utility Navigation Items */}
				<div className="p-2 border-t border-border space-y-1">
					{utilityNavigationItems.map((item) => {
						const Icon = item.icon;
						const isActive = activeItem === item.id;

						return (
							<button
								key={item.id}
								onClick={() => handleTabChange(item.id)}
								className={`w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 group relative ${
									isActive
										? 'bg-primary text-primary-foreground shadow-sm'
										: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
								}`}>
								<div className="relative">
									<Icon
										className={`h-5 w-5 transition-transform group-hover:scale-110 ${
											isActive ? 'text-primary-foreground' : ''
										}`}
									/>
									{item.badge && (
										<Badge
											variant="destructive"
											className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center">
											{item.badge}
										</Badge>
									)}
								</div>

								{/* Active indicator */}
								{isActive && (
									<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-r-full" />
								)}
							</button>
						);
					})}
				</div>

				{/* User Menu */}
				<div className="p-2 border-t border-border">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button className="w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 group relative text-muted-foreground hover:bg-accent hover:text-accent-foreground">
								<Avatar className="h-5 w-5">
									<AvatarFallback className="text-xs bg-primary text-primary-foreground">
										{user?.email?.charAt(0).toUpperCase() || 'U'}
									</AvatarFallback>
								</Avatar>
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start" className="w-56">
							<DropdownMenuLabel className="text-xs">{user?.email}</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => navigate('/myaccount')}
								className="cursor-pointer">
								<User className="mr-2 h-4 w-4" />
								My Account
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => signOut()}
								className="cursor-pointer text-destructive focus:text-destructive">
								<LogOut className="mr-2 h-4 w-4" />
								Logout
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Main Content */}
				<main className="flex-1 overflow-auto bg-muted/30 p-6">
					<div className="w-full">
						{/* Content based on active navigation item */}
						{activeItem === 'prospect' ? (
							<div id="module-prospect" className="h-full">
								<ProspectModule previewMode={previewMode} />
							</div>
						) : activeItem === 'match' ? (
							<div id="module-match" className="h-full">
								<MatchModule />
							</div>
						) : activeItem === 'write' ? (
							<div id="module-write" className="h-full">
								<CreateModule />
							</div>
						) : activeItem === 'design' ? (
							<div id="module-design" className="h-full">
								<DesignModule />
							</div>
						) : activeItem === 'apply' ? (
							<div id="module-apply" className="h-full">
								<LaunchModule />
							</div>
						) : activeItem === 'pay' ? (
							<PayModule />
						) : activeItem === 'setup' ? (
							<div className="bg-card rounded-lg border p-8 text-center">
								<h2 className="text-xl font-semibold mb-4">Setup Your Subscription</h2>
								<Button
									onClick={async () => {
										try {
											console.log('Setting up subscription...');
											const { data, error } = await supabase.functions.invoke(
												'check-subscription'
											);
											if (error) throw error;
											console.log('Setup result:', data);
											alert('Subscription setup complete! Check the Pay tab.');
											handleTabChange('pay');
										} catch (error) {
											console.error('Setup failed:', error);
											alert('Setup failed: ' + error.message);
										}
									}}>
									Setup Free Plan
								</Button>
							</div>
						) : activeItem === 'track' ? (
							<TrackModule />
						) : activeItem === 'notifications' ? (
							<>
								<div className="bg-card rounded-lg border p-8 text-center">
									<div className="mb-6">
										<Bell className="h-16 w-16 mx-auto text-primary mb-4" />
									</div>
									<h2 className="text-xl font-semibold mb-2">Notifications</h2>
									<p className="text-muted-foreground mb-6">
										Stay updated with your outreach progress and responses.
									</p>
									<Button variant="hero" size="lg">
										View All Notifications
									</Button>
								</div>
							</>
						) : (
							<>
								<div className="bg-card rounded-lg border p-8 text-center">
									<div className="mb-6">
										{React.createElement(
											allNavigationItems.find((item) => item.id === activeItem)?.icon ||
												Target,
											{
												className: 'h-16 w-16 mx-auto text-primary mb-4'
											}
										)}
									</div>
									<h2 className="text-xl font-semibold mb-2">
										{allNavigationItems.find((item) => item.id === activeItem)?.label}{' '}
										Module
									</h2>
									<p className="text-muted-foreground mb-6">
										This is where the{' '}
										{allNavigationItems
											.find((item) => item.id === activeItem)
											?.label.toLowerCase()}{' '}
										functionality will be implemented.
									</p>
									<Button variant="hero" size="lg">
										Get Started with{' '}
										{allNavigationItems.find((item) => item.id === activeItem)?.label}
									</Button>
								</div>

								{/* Sample Cards */}
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
									{[1, 2, 3].map((i) => (
										<div key={i} className="bg-card rounded-lg border p-6">
											<div className="h-4 w-4 bg-primary rounded mb-4" />
											<h3 className="font-medium mb-2">Feature {i}</h3>
											<p className="text-sm text-muted-foreground">
												Sample content for the{' '}
												{allNavigationItems
													.find((item) => item.id === activeItem)
													?.label.toLowerCase()}{' '}
												module.
											</p>
										</div>
									))}
								</div>
							</>
						)}
					</div>
				</main>
			</div>

			{/* Guided Tour */}
			<GuidedTour onNavigate={handleTabChange} activeModule={activeItem} />

			{/* Background Processing Indicator */}
			<BackgroundProcessingIndicator />
		</div>
	);
};

export default Hub;
