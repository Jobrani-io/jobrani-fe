import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	Target,
	Brain,
	Users,
	FolderOpen,
	CheckCircle,
	Bell,
	Settings,
	User,
	ChevronLeft,
	ChevronRight,
	Zap,
	Rocket,
	UserCheck,
	LogOut,
	CreditCard
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import ProfileModule from '@/components/ProfileModule';

const coreNavigationItems = [
	{
		id: 'prospect',
		icon: Target,
		label: 'Prospect',
		description: 'Find and add prospects',
		badge: null
	},
	{
		id: 'bulk-send',
		icon: Zap,
		label: 'Design',
		description: 'Plan your outreach',
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
		id: 'launch',
		icon: Rocket,
		label: 'Apply',
		description: 'Submit applications',
		badge: null
	},
	{
		id: 'track',
		icon: CheckCircle,
		label: 'Track',
		description: 'Analytics & list management',
		badge: null
	},
	{
		id: 'pay',
		icon: CreditCard,
		label: 'Pay',
		description: 'Subscription & billing',
		badge: null
	}
];

const utilityNavigationItems = [
	{
		id: 'notifications',
		icon: Bell,
		label: 'Notifications',
		description: 'Updates & alerts',
		badge: 6
	}
];

const MyAccount = () => {
	const { user, signOut } = useAuth();
	const navigate = useNavigate();

	const handleNavigateToHub = (itemId?: string) => {
		if (itemId) {
			navigate(`/hub?tab=${itemId}`);
		} else {
			navigate('/hub');
		}
	};

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

						return (
							<button
								key={item.id}
								onClick={() => handleNavigateToHub(item.id)}
								className="w-full flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 group relative text-muted-foreground hover:bg-accent hover:text-accent-foreground py-2">
								<div className="relative mb-1">
									<Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
									{item.badge && (
										<Badge
											variant="destructive"
											className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center">
											{item.badge}
										</Badge>
									)}
								</div>

								<div className="text-center min-w-0 w-full">
									<div className="font-medium text-xs">{item.label}</div>
								</div>
							</button>
						);
					})}
				</nav>

				{/* Utility Navigation Items */}
				<div className="p-2 border-t border-border space-y-1">
					{utilityNavigationItems.map((item) => {
						const Icon = item.icon;

						return (
							<button
								key={item.id}
								onClick={() => handleNavigateToHub(item.id)}
								className="w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 group relative text-muted-foreground hover:bg-accent hover:text-accent-foreground">
								<div className="relative">
									<Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
									{item.badge && (
										<Badge
											variant="destructive"
											className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center">
											{item.badge}
										</Badge>
									)}
								</div>
							</button>
						);
					})}
				</div>

				{/* User Menu */}
				<div className="p-2 border-t border-border">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button className="w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 group relative bg-primary text-primary-foreground shadow-sm">
								<Avatar className="h-5 w-5">
									<AvatarFallback className="text-xs bg-primary text-primary-foreground">
										{user?.email?.charAt(0).toUpperCase() || 'U'}
									</AvatarFallback>
								</Avatar>

								{/* Active indicator */}
								<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-r-full" />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start" className="w-56">
							<DropdownMenuLabel className="text-xs">{user?.email}</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => navigate('/myaccount')}
								className="cursor-pointer bg-accent">
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
						<ProfileModule />
					</div>
				</main>
			</div>
		</div>
	);
};

export default MyAccount;
