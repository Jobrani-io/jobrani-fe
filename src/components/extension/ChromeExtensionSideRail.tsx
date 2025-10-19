import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chrome, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChromeExtensionSideRailProps {
	onAddExtension: () => void;
	onSyncNow: () => void;
	isExtensionConnected: boolean;
	isSyncing?: boolean;
}

export function ChromeExtensionSideRail({
	onAddExtension,
	onSyncNow,
	isExtensionConnected,
	isSyncing = false
}: ChromeExtensionSideRailProps) {
	return (
		<Card className="p-4 w-[280px] shrink-0 h-fit">
			<div className="space-y-4">
				<div className="space-y-2">
					<h5 className="font-medium text-foreground">
						{isExtensionConnected
							? 'Extension Connected'
							: "Already Saved Jobs on LinkedIn or Don't Like Your Results?"}
					</h5>
					<p className="text-sm text-muted-foreground">
						{isExtensionConnected
							? 'Sync your saved LinkedIn jobs directly into Jobrani.'
							: 'Import them here instead of searching manually.'}
					</p>
				</div>

				<div className="space-y-2">
					{isExtensionConnected ? (
						<>
							<Badge
								variant="secondary"
								className="w-full justify-center bg-primary/10 text-primary border-primary/20 mb-2">
								<Chrome className="h-3 w-3 mr-1" />
								Connected ✅
							</Badge>
							<Button
								onClick={onSyncNow}
								disabled={isSyncing}
								className="w-full gap-2"
								variant="outline">
								{isSyncing ? (
									<RefreshCw className="h-4 w-4 animate-spin" />
								) : (
									<RefreshCw className="h-4 w-4" />
								)}
								{isSyncing ? 'Syncing...' : 'Sync Now'}
							</Button>
						</>
					) : (
						<>
							<Button onClick={onAddExtension} variant="outline" className="w-full gap-2">
								<Chrome className="h-4 w-4" />
								Add Chrome Extension
							</Button>
							<Button
								onClick={onSyncNow}
								variant="link"
								className="w-full text-left justify-start p-0 h-auto text-sm text-muted-foreground hover:text-foreground">
								Sync Now
							</Button>
						</>
					)}
				</div>
			</div>
		</Card>
	);
}
