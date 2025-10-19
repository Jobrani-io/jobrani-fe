import { BetaAccessOverlay } from '@/components/BetaAccessOverlay';
import ProspectModule from '@/components/ProspectModule';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Bell,
	Brain,
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	Rocket,
	Target,
	User,
	Zap
} from 'lucide-react';
import { useState } from 'react';

const coreNavigationItems = [
	{
		id: 'prospect',
		icon: Target,
		label: 'Prospect',
		description: 'Find and add prospects',
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
		id: 'bulk-send',
		icon: Zap,
		label: 'Design',
		description: 'Plan your outreach',
		badge: null
	},
	{
		id: 'launch',
		icon: Rocket,
		label: 'Launch',
		description: 'Execute your campaign',
		badge: null
	},
	{
		id: 'track',
		icon: CheckCircle,
		label: 'Track',
		description: 'Analytics & results',
		badge: null
	},
	{
		id: 'draft',
		icon: Brain,
		label: 'Draft',
		description: 'AI message creation',
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
	},
	{
		id: 'profile',
		icon: User,
		label: 'Profile',
		description: 'Account & settings',
		badge: null
	}
];

const allNavigationItems = [...coreNavigationItems, ...utilityNavigationItems];

const Dashboard = () => {
	const [isExpanded] = useState(false);
	const [activeItem] = useState('prospect');

	return (
		<div className="h-screen bg-background flex overflow-hidden">
			{/* Blurred Hub Interface */}
			<div className="blur-sm select-none pointer-events-none w-full flex">
				{/* Left Sidebar */}
				<div
					className={`relative bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out ${
						isExpanded ? 'w-64' : 'w-20'
					}`}>
					{/* Toggle Button */}
					<div className="absolute -right-3 top-6 z-10">
						<Button
							variant="outline"
							size="icon"
							className="h-6 w-6 rounded-full bg-background border shadow-md hover:shadow-lg">
							{isExpanded ? (
								<ChevronLeft className="h-3 w-3" />
							) : (
								<ChevronRight className="h-3 w-3" />
							)}
						</Button>
					</div>

					{/* Header */}
					<div className="h-[80px] border-b border-border flex items-center justify-center px-4">
						{isExpanded ? (
							<img
								src="/lovable-uploads/7a778747-db11-4bc7-87a1-348a5abafb62.png"
								alt="Jobrani Logo"
								className="h-12 w-auto"
							/>
						) : (
							<img
								src="/lovable-uploads/7a778747-db11-4bc7-87a1-348a5abafb62.png"
								alt="Jobrani Logo"
								className="h-12 w-12 object-contain"
							/>
						)}
					</div>

					{/* Core Navigation Items */}
					<nav className="flex-1 p-2 space-y-1">
						{coreNavigationItems.map((item) => {
							const Icon = item.icon;
							const isActive = activeItem === item.id;

							return (
								<button
									key={item.id}
									className={`w-full flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 group relative ${
										isActive
											? 'bg-primary text-primary-foreground shadow-sm'
											: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
									} ${isExpanded ? 'px-3 py-3' : 'py-2'}`}>
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
											} ${isExpanded ? 'text-sm' : ''}`}>
											{item.label}
										</div>
										{isExpanded && (
											<div
												className={`text-xs ${
													isActive
														? 'text-primary-foreground/80'
														: 'text-muted-foreground'
												} truncate mt-1`}>
												{item.description}
											</div>
										)}
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
				</div>

				{/* Main Content Area */}
				<div className="flex-1 flex flex-col overflow-hidden">
					{/* Main Content */}
					<main className="flex-1 overflow-auto bg-muted/30 p-6">
						<div className="max-w-6xl mx-auto">
							<ProspectModule previewMode={true} onTriggerWaitlist={() => {}} />
						</div>
					</main>
				</div>
			</div>

			{/* Beta Access Overlay */}
			<BetaAccessOverlay />
		</div>
	);
};

export default Dashboard;
