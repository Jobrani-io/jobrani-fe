import { ChromeExtensionSideRail } from '@/components/extension/ChromeExtensionSideRail';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getUnifiedProspectSearchResults, unifiedMatchDataService } from '@/data/unifiedMockData';
import { toast } from '@/hooks/use-toast';
import { useExtensionDetection } from '@/hooks/useExtensionDetection';
import { useGlobalMockData } from '@/hooks/useGlobalMockData';
import { supabase } from '@/integrations/supabase/client';
import { analyticsService } from '@/services/analyticsService';
import savedProspectsService, { SavedProspect } from '@/services/savedProspectsService';
import { Prospect, ProspectSearchRequest, ProspectSearchResponse } from '@/types/theirstack';
import {
	Calendar,
	CheckCheck,
	CheckCircle,
	Chrome,
	Eye,
	EyeOff,
	Linkedin,
	RotateCcw,
	Search,
	XCircle
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import LinkedInOAuthModal from './LinkedInOAuthModal';

// TanStack Query
import { useSubscription } from '@/contexts/SubscriptionContext';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

// Simplified Prospect interface for JSearch API response
interface JSearchProspect {
	id: string;
	organization: string;
	title: string;
	date_posted: string;
	locations_derived: string[];
	url: string;
	company_url: string;
	job_description: string;
	employment_type: string;
	is_remote: boolean;
	posted_human_readable?: string;
	raw?: any;
}

// Extended interface for table display with status
interface TableProspect extends JSearchProspect {
	isCompleted: boolean;
	status: string;
}

interface ProspectModuleProps {
	previewMode?: boolean;
	onTriggerWaitlist?: () => void;
}

// ---------- Helper for fetching a page ----------
const PAGE_SIZE = 10;

// Fetch prospects from the search API or mock data
const fetchProspectsPage = async (
	filters: ProspectSearchRequest,
	useMockData: boolean
): Promise<ProspectSearchResponse | null> => {
	console.log('fetchProspectsPage called with filters:', JSON.stringify(filters, null, 2));

	if (useMockData) {
		// Return unified mock data in response format
		const offset = ((filters.page || 1) - 1) * PAGE_SIZE;
		const mockResults = getUnifiedProspectSearchResults(offset, PAGE_SIZE);

		const mockProspects: JSearchProspect[] = mockResults.map((item) => ({
			id: item.id,
			organization: item.companyName,
			title: item.jobTitle,
			date_posted: '2024-01-15',
			locations_derived: [item.location],
			url: item.linkedinUrl,
			company_url: '',
			job_description: 'Mock job description',
			employment_type: 'FULLTIME',
			is_remote: false
		}));

		return {
			data: mockProspects,
			metadata: {
				total_results: 100, // Mock total
				page: filters.page || 1,
				limit: PAGE_SIZE,
				has_next_page: mockProspects.length === PAGE_SIZE
			}
		};
	}

	// TheirStack API logic
	const { data, error } = await supabase.functions.invoke('search-prospects', {
		body: filters
	});

	console.log('fetch prospects data', JSON.stringify(data, null, 2));
	if (error) throw error;

	return data as ProspectSearchResponse;
};

const ProspectModuleInner = (props: ProspectModuleProps) => {
	const { useMockData } = useGlobalMockData();

	const [showCompleted, setShowCompleted] = useState(true);
	const [showLinkedInModal, setShowLinkedInModal] = useState(false);
	const [isSyncing, setIsSyncing] = useState(false);

	// Live (editable) filters
	const [jobTitles, setJobTitles] = useState<string[]>([]);
	const [jobDescriptions, setJobDescriptions] = useState<string[]>([]);
	const [jobLocations, setJobLocations] = useState<string[]>([]);
	const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);
	const [postingDate, setPostingDate] = useState<string>('all');
	const [companies, setCompanies] = useState<string[]>([]);
	const [isRemote, setIsRemote] = useState<boolean>(false);
	const [exactMode, setExactMode] = useState<boolean>(false);

	// Load onboarding data on component mount
	useEffect(() => {
		const loadOnboardingData = () => {
			try {
				const onboardingData = localStorage.getItem('jobrani-onboarding-data');
				if (onboardingData) {
					const parsedData = JSON.parse(onboardingData);
					console.log('ProspectModule: Loading onboarding data:', parsedData);

					// Populate job titles from desired roles (use first one as primary)
					if (parsedData.desiredRoles && parsedData.desiredRoles.length > 0) {
						setJobTitles([parsedData.desiredRoles[0]]); // Set first role as primary search
					}

					// Populate locations from onboarding preferences
					if (parsedData.locationPreferences) {
						const { cities, remote, hybrid, onsite } = parsedData.locationPreferences;

						// Set remote preference
						if (remote) {
							setIsRemote(true);
						}

						// Add cities if specified
						if (cities && cities.length > 0) {
							setJobLocations(cities);
						}
					}

					console.log('ProspectModule: Applied onboarding preferences');
				}
			} catch (error) {
				console.warn('Failed to load onboarding data for prospect filters:', error);
			}
		};

		loadOnboardingData();
	}, []);

	// Snapshot of filters used for the *last triggered search*
	const [committedFilters, setCommittedFilters] = useState<ProspectSearchRequest | null>(null);

	// Pagination/UI state
	const [currentPage, setCurrentPage] = useState(1);
	const [searchNonce, setSearchNonce] = useState(0);
	const [cleared, setCleared] = useState(false);

	const [savedProspects, setSavedProspects] = useState<SavedProspect[]>([]);
	const [unapprovedProspects, setUnapprovedProspects] = useState<JSearchProspect[]>([]);

	const { isLimitReached } = useSubscription();

	const {
		isExtensionConnected,
		extensionError,
		isDetecting,
		installExtension,
		syncWithExtension
	} = useExtensionDetection();

	const handleLinkedInConnect = () => setShowLinkedInModal(true);

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const linkedinSuccess = urlParams.get('linkedin_success');
		const linkedinError = urlParams.get('linkedin_error');
		if ((linkedinSuccess || linkedinError) && !showLinkedInModal) setShowLinkedInModal(true);
	}, [showLinkedInModal]);

	const loadSavedProspects = useCallback(async () => {
		const service = useMockData ? unifiedMatchDataService : savedProspectsService;
		const prospects = await service.getSavedProspects();
		setSavedProspects(prospects);
	}, [useMockData]);

	const loadUnapprovedProspects = useCallback(() => {
		try {
			const unapprovedData = localStorage.getItem('jobrani-unapproved-prospects');
			if (unapprovedData) {
				const prospects = JSON.parse(unapprovedData);
				console.log('ProspectModule: Loaded unapproved prospects:', prospects);
				setUnapprovedProspects(prospects);
			}
		} catch (error) {
			console.warn('Failed to load unapproved prospects:', error);
			setUnapprovedProspects([]);
		}
	}, []);

	useEffect(() => {
		loadSavedProspects();
		loadUnapprovedProspects();
	}, [loadSavedProspects, loadUnapprovedProspects]);

	// Listen for saved prospects updates from onboarding auto-save
	useEffect(() => {
		const handleSavedProspectsUpdate = () => {
			console.log('ProspectModule: Received saved prospects update event, refreshing...');
			loadSavedProspects();
			loadUnapprovedProspects();
		};

		window.addEventListener('jobrani-saved-prospects-updated', handleSavedProspectsUpdate);

		return () => {
			window.removeEventListener('jobrani-saved-prospects-updated', handleSavedProspectsUpdate);
		};
	}, [loadSavedProspects, loadUnapprovedProspects]);

	const handleLinkedInSuccess = (accessToken: string, profile?: any) => {
		setShowLinkedInModal(false);
		localStorage.setItem('linkedin_connected', 'true');
		if (profile) localStorage.setItem('linkedin_profile', JSON.stringify(profile));
		toast({
			title: 'LinkedIn Connected!',
			description: `Welcome ${
				profile?.firstName || 'User'
			}! Your LinkedIn account has been successfully connected.`
		});
	};

	const handleAddExtension = () => {
		analyticsService.trackAddChromeExtensionClick(
			readyToComplete.length > 0 ? 'side_rail' : 'empty_state'
		);
		installExtension();
	};

	const handleSyncNow = async (context: 'banner' | 'side_rail' = 'banner') => {
		analyticsService.trackSyncNowClick(context);

		if (!isExtensionConnected) {
			toast({
				title: 'Extension Required',
				description: 'Please install the Chrome Extension first to sync LinkedIn jobs.',
				variant: 'destructive'
			});
			return;
		}

		setIsSyncing(true);
		try {
			const result = await syncWithExtension();

			if (result.success) {
				analyticsService.trackSyncSuccess(result.data?.jobCount);
				toast({
					title: 'Sync Complete',
					description: `Successfully synced ${result.data?.jobCount || 0} jobs from LinkedIn.`
				});
			} else {
				analyticsService.trackSyncError(result.error);
				toast({
					title: 'Sync Failed',
					description: result.error || 'Failed to sync LinkedIn jobs.',
					variant: 'destructive'
				});
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			analyticsService.trackSyncError(errorMessage);
			toast({
				title: 'Sync Error',
				description: 'An unexpected error occurred during sync.',
				variant: 'destructive'
			});
		} finally {
			setIsSyncing(false);
		}
	};

	// Live filters object (for editing only)
	const liveFilters = useMemo(
		() => ({
			jobTitles: jobTitles.length ? jobTitles : [],
			jobDescriptions: jobDescriptions.length ? jobDescriptions : [],
			jobLocations: jobLocations.length ? jobLocations : [],
			employmentTypes: employmentTypes.length ? employmentTypes : [],
			postingDate,
			companies: companies.length ? companies : [],
			isRemote,
			exactMode,
			page: 1,
			limit: PAGE_SIZE
		}),
		[
			jobTitles,
			jobDescriptions,
			jobLocations,
			employmentTypes,
			postingDate,
			companies,
			isRemote,
			exactMode
		]
	);

	// Memoized query function to prevent unnecessary recreations
	const queryFn = useCallback(async () => {
		if (!committedFilters) return null;
		console.log('useQuery executing fetchProspectsPage...');
		return fetchProspectsPage(committedFilters, useMockData);
	}, [committedFilters, useMockData]);

	// useQuery for simple pagination instead of infinite query
	const { data, isFetching } = useQuery({
		queryKey: ['prospects', committedFilters, searchNonce],
		queryFn,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		enabled: committedFilters !== null, // 🔒 only fetch after an explicit trigger
		staleTime: 60_000,
		retry: false, // Disable automatic retries to prevent multiple API calls on failure
		retryOnMount: false
	});

	const searchResults: JSearchProspect[] = cleared ? [] : data?.data || [];
	const isSearching = isFetching;
	const hasNextPage = data?.metadata?.has_next_page || false;

	// ---------- Triggered search only (Enter key or Search button) ----------
	const triggerSearch = useCallback(() => {
		// Prevent multiple concurrent searches
		if (isFetching) {
			console.log('Search already in progress, skipping duplicate call');
			return;
		}

		console.log('Triggering new search...');

		// Reset pagination and set filters in a single update
		setCurrentPage(1);
		const filtersWithPage = { ...liveFilters, page: 1 };

		// Use functional updates to ensure consistency
		setCommittedFilters(filtersWithPage);
		setCleared(false);
		setSearchNonce((n) => n + 1);
	}, [isFetching, liveFilters]);

	const handleNewSearch = (e?: React.KeyboardEvent) => {
		e?.preventDefault();
		e?.stopPropagation();
		triggerSearch();
	};

	const handleNextPage = () => {
		if (!hasNextPage || isFetching) return;
		const nextPage = currentPage + 1;
		setCurrentPage(nextPage);
		if (committedFilters) {
			const filtersWithPage = { ...committedFilters, page: nextPage };
			setCommittedFilters(filtersWithPage);
			setSearchNonce((n) => n + 1);
		}
	};

	const handlePrevPage = () => {
		if (currentPage <= 1 || isFetching) return;
		const prevPage = currentPage - 1;
		setCurrentPage(prevPage);
		if (committedFilters) {
			const filtersWithPage = { ...committedFilters, page: prevPage };
			setCommittedFilters(filtersWithPage);
			setSearchNonce((n) => n + 1);
		}
	};

	const handleBulkComplete = async () => {
		const generatedTableProspects: TableProspect[] = searchResults
			.filter(
				(result) =>
					!savedProspects.some((savedProspect) => savedProspect.prospect_id === result.id)
			)
			.map((result) => ({
				...result,
				isCompleted: true,
				status: 'completed',
				url: result.url
			}));
		await handleBulkSaveProspect(generatedTableProspects);
		setShowCompleted(true);
	};

	const handleBulkSaveProspect = async (prospects: TableProspect[]) => {
		for (const prospect of prospects) await handleSaveProspect(prospect);
	};

	const handleSaveProspect = async ({
		id,
		organization,
		title,
		locations_derived,
		date_posted,
		url,
		company_url,
		job_description,
		raw
	}: TableProspect) => {
		const service = useMockData ? unifiedMatchDataService : savedProspectsService;
		const savedProspect = await service.saveProspect({
			prospect_id: id,
			company: organization,
			job_title: title,
			location: locations_derived?.[0],
			posted_on: date_posted,
			url: url,
			company_url,
			job_description,
			raw
		});
		if (savedProspect) {
			setSavedProspects((prev) => [savedProspect, ...prev]);
			// Remove from unapproved prospects if it was there
			setUnapprovedProspects((prev) => {
				const updated = prev.filter((p) => p.id !== id);
				localStorage.setItem('jobrani-unapproved-prospects', JSON.stringify(updated));
				return updated;
			});
		}
	};

	const handleUnsaveProspect = async (prospectId: string) => {
		const service = useMockData ? unifiedMatchDataService : savedProspectsService;
		const success = await service.deleteSavedProspect(prospectId);
		if (success) setSavedProspects((prev) => prev.filter((p) => p.prospect_id !== prospectId));
	};

	const handleToggleCompleted = () => setShowCompleted(!showCompleted);

	const readyToComplete: TableProspect[] = [
		// Include search results - show ALL search results, including saved ones
		...(searchResults ?? []).map((prospect: Prospect) => ({
			...prospect,
			isCompleted: savedProspects.some((sp) => sp.prospect_id === prospect.id),
			status: savedProspects.some((sp) => sp.prospect_id === prospect.id)
				? 'completed'
				: 'ready-to-complete',
			url: prospect.url
		})),
		// Include unapproved prospects from onboarding (only those not already in search results)
		...unapprovedProspects
			.filter(
				(prospect) =>
					!savedProspects.some((sp) => sp.prospect_id === prospect.id) &&
					!searchResults.some((sr) => sr.id === prospect.id)
			)
			.map((prospect) => ({
				...prospect,
				isCompleted: false,
				status: 'ready-to-complete' as const
			}))
	];

	const completed: TableProspect[] = savedProspects?.map((prospect) => ({
		id: prospect.prospect_id,
		organization: prospect.company,
		title: prospect.job_title,
		locations_derived: [prospect.location],
		date_posted: prospect.posted_on,
		isCompleted: true,
		status: 'completed',
		url: prospect.url,
		company_url: prospect.company_url || '',
		job_description: prospect.job_description || '',
		employment_type: prospect.employment_type || 'Unknown',
		is_remote: prospect.is_remote || false,
		raw: prospect
	}));

	console.log('ProspectModule Debug:', {
		hasNextPage,
		searchResultsLength: searchResults.length,
		unapprovedProspectsLength: unapprovedProspects.length,
		savedProspectsLength: savedProspects.length,
		readyToCompleteLength: readyToComplete.length,
		completedLength: completed.length,
		isFetching,
		cleared,
		apiData: data?.data?.slice(0, 2) // Show first 2 items from API for debugging
	});

	return (
		<div className="w-full space-y-4" id="saved-prospects-section">
			<div className="space-y-6">
				{/* Horizontal Filter Bar */}
				<Card className="p-6">
					<div className="space-y-4">
						<div className="flex items-center justify-between flex-wrap gap-4">
							<h3 className="text-lg font-semibold">Search Job Opportunities</h3>
							<button
								onClick={
									isExtensionConnected ? () => handleSyncNow('banner') : handleAddExtension
								}
								className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-2 group disabled:opacity-60 disabled:text-muted-foreground disabled:cursor-default"
								disabled={isSyncing || true}>
								<Chrome className="h-4 w-4 text-primary" />
								<span className="hidden sm:inline">
									{isExtensionConnected ? (
										isSyncing ? (
											'Syncing LinkedIn jobs...'
										) : (
											'Sync your LinkedIn jobs'
										)
									) : (
										<>
											Don't like these results? Try our{' '}
											<span className="bg-primary/10 text-primary px-2 py-1 rounded-md font-medium">
												LinkedIn Chrome Extension (Coming Soon)
											</span>
										</>
									)}
								</span>
								<span className="sm:hidden">
									{isExtensionConnected
										? isSyncing
											? 'Syncing...'
											: 'Sync Jobs'
										: 'Get Extension'}
								</span>
							</button>
						</div>

						<div className="space-y-4">
							{/* Primary Row - Main Search Fields */}
							<div className="bg-card/50 p-4 rounded-lg border">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<label className="text-sm font-semibold text-foreground">
												Job Title
											</label>
											<div className="flex items-center space-x-2 text-xs">
												<span
													className={
														!exactMode
															? 'text-muted-foreground'
															: 'text-foreground font-medium'
													}>
													Exact
												</span>
												<Switch
													checked={!exactMode}
													onCheckedChange={(checked) => setExactMode(!checked)}
												/>
												<span
													className={
														exactMode
															? 'text-muted-foreground'
															: 'text-foreground font-medium'
													}>
													Expanded
												</span>
											</div>
										</div>
										<Input
											placeholder="e.g. Software Engineer"
											value={jobTitles.join(', ')}
											onChange={(e) => {
												const value = e.target.value;
												if (value.includes(',')) {
													// Only process as comma-separated when there are actual commas
													setJobTitles(
														value
															.split(',')
															.map((t) => t.trim())
															.filter(Boolean)
													);
												} else {
													// Single value - preserve all spaces
													setJobTitles(value ? [value] : []);
												}
											}}
											disabled={isSearching}
											className="text-sm"
										/>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-semibold text-foreground">
											Location
										</label>
										<Input
											placeholder="e.g. New York, NY"
											value={jobLocations.join(', ')}
											onChange={(e) => {
												const value = e.target.value;
												if (value.includes(',')) {
													// Only process as comma-separated when there are actual commas
													setJobLocations(
														value
															.split(',')
															.map((l) => l.trim())
															.filter(Boolean)
													);
												} else {
													// Single value - preserve all spaces
													setJobLocations(value ? [value] : []);
												}
											}}
											disabled={isSearching}
											className="text-sm"
										/>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-semibold text-foreground">
											Posting Date
										</label>
										<div className="flex gap-2">
											<Select
												value={postingDate}
												onValueChange={setPostingDate}
												disabled={isSearching}>
												<SelectTrigger className="text-sm flex-1">
													<SelectValue placeholder="Select date range" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="today">Today</SelectItem>
													<SelectItem value="3days">Past 3 days</SelectItem>
													<SelectItem value="week">Past week</SelectItem>
													<SelectItem value="month">Past month</SelectItem>
													<SelectItem value="all">All time</SelectItem>
												</SelectContent>
											</Select>
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															onClick={triggerSearch}
															disabled={isSearching}
															size="sm"
															className="px-2">
															{isSearching ? (
																<RotateCcw className="h-4 w-4 animate-spin" />
															) : (
																<Search className="h-4 w-4" />
															)}
														</Button>
													</TooltipTrigger>
													<TooltipContent>
														<p>{isSearching ? 'Searching...' : 'Search for jobs'}</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</div>
									</div>
								</div>
							</div>

							{/* Secondary Row - Additional Filters */}
							<div className="bg-muted/30 p-3 rounded-lg border">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
									<div className="space-y-1">
										<label className="text-xs font-medium text-muted-foreground">
											Keywords
										</label>
										<Input
											placeholder="Enter keywords..."
											value={jobDescriptions[0] || ''}
											onChange={(e) =>
												setJobDescriptions(e.target.value ? [e.target.value] : [])
											}
											onKeyDown={(e) => e.key === 'Enter' && handleNewSearch(e)}
											disabled={isSearching}
											className="text-sm h-8"
										/>
									</div>

									<div className="space-y-1">
										<label className="text-xs font-medium text-muted-foreground">
											Company
										</label>
										<Input
											placeholder="Enter company..."
											value={companies[0] || ''}
											onChange={(e) =>
												setCompanies(e.target.value ? [e.target.value] : [])
											}
											onKeyDown={(e) => e.key === 'Enter' && handleNewSearch(e)}
											disabled={isSearching}
											className="text-sm h-8"
										/>
									</div>

									<div className="space-y-1">
										<label className="text-xs font-medium text-muted-foreground">
											Employment Type
										</label>
										<Select
											value={employmentTypes[0] || ''}
											onValueChange={(v) => setEmploymentTypes(v ? [v] : [])}
											disabled={isSearching}>
											<SelectTrigger className="text-sm h-8">
												<SelectValue placeholder="Select type..." />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="FULL_TIME">Full-time</SelectItem>
												<SelectItem value="PART_TIME">Part-time</SelectItem>
												<SelectItem value="CONTRACTOR">Contractor</SelectItem>
												<SelectItem value="INTERNSHIP">Internship</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-1">
										<label className="text-xs font-medium text-muted-foreground">
											Remote Work
										</label>
										<Select
											value={jobLocations.includes('Remote') ? 'true' : 'false'}
											onValueChange={(v) => {
												if (v === 'true') {
													setIsRemote(true);
												} else {
													setIsRemote(false);
												}
											}}
											disabled={isSearching}>
											<SelectTrigger className="text-sm h-8">
												<SelectValue placeholder="Remote..." />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="false">No preference</SelectItem>
												<SelectItem value="true">Remote only</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Card>

				{/* Search Results */}
				<Card className="p-6">
					<div className={`space-y-6 ${readyToComplete.length > 0 ? 'flex gap-6' : ''}`}>
						{/* Main Results Area */}
						<div className={`${readyToComplete.length > 0 ? 'flex-1' : 'w-full'} space-y-6`}>
							{/* Results Header */}
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<h3 className="text-lg font-semibold">
										{readyToComplete.length > 0
											? 'Search Results'
											: !isSearching && readyToComplete.length === 0
											? 'No Jobs Found'
											: 'Search Results'}{' '}
										({isSearching ? 'Searching...' : `${readyToComplete.length}`})
									</h3>
									{(data?.data?.length || 0) > 0 && !cleared && (
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setCleared(true);
												setCurrentPage(1);
											}}
											className="gap-2">
											Clear Results
										</Button>
									)}
								</div>
								<div className="flex items-center gap-2">
									<Button
										onClick={handleToggleCompleted}
										variant="outline"
										size="sm"
										className="gap-2">
										{showCompleted ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
										{showCompleted ? 'Hide' : 'Show'} Saved
									</Button>
									{readyToComplete.length > 0 && (
										<Button
											onClick={handleBulkComplete}
											variant="secondary"
											size="sm"
											className="gap-2 h-8 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20">
											<CheckCheck className="h-4 w-4" />
											Complete All
										</Button>
									)}
								</div>
							</div>

							{/* Results Table or No Results */}
							{isSearching && readyToComplete.length === 0 ? (
								<div className="border rounded-lg p-8 text-center">
									<div className="text-muted-foreground">
										<RotateCcw className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
										<p className="text-lg font-medium mb-2">Searching for Jobs</p>
										<p className="text-sm">Finding the best opportunities for you...</p>
									</div>
								</div>
							) : readyToComplete.length > 0 ? (
								<>
									{isSearching && (
										<div className="border rounded-lg p-4 text-center bg-blue-50 border-blue-200">
											<div className="text-blue-600 flex items-center justify-center gap-2">
												<RotateCcw className="h-4 w-4 animate-spin" />
												<span className="text-sm font-medium">
													Updating search results...
												</span>
											</div>
										</div>
									)}
									<div className="border rounded-lg overflow-hidden">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead className="w-12">#</TableHead>
													<TableHead>Company Name</TableHead>
													<TableHead>Job Title</TableHead>
													<TableHead>Location</TableHead>
													<TableHead className="w-32">
														<div className="flex items-center gap-1">
															Posted On
															<Calendar className="h-3 w-3" />
														</div>
													</TableHead>
													<TableHead className="w-32">Actions</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{readyToComplete.map((item, index) => (
													<TableRow
														key={item.id}
														className="hover:bg-muted/50 h-10"
														id={index === 0 ? 'first-search-result' : undefined}>
														<TableCell className="font-mono text-sm text-muted-foreground py-2">
															{index + 1 + (currentPage - 1) * PAGE_SIZE}
														</TableCell>
														<TableCell className="font-medium py-2 truncate">
															{item.organization}
														</TableCell>
														<TableCell className="py-2 truncate">
															<a
																href={item.url}
																target="_blank"
																rel="noopener noreferrer"
																className="text-orange-600 hover:text-orange-800 underline cursor-pointer">
																{item.title}
															</a>
														</TableCell>
														<TableCell className="text-muted-foreground py-2 truncate">
															{item.locations_derived?.[0]}
														</TableCell>
														<TableCell className="text-sm text-muted-foreground py-2 truncate">
															{item.posted_human_readable || item.date_posted}
														</TableCell>
														<TableCell className="py-2">
															<div className="flex items-center gap-1">
																<Button
																	onClick={() => {
																		const prospectId = item.id;
																		if (
																			savedProspects.some(
																				(sp) => sp.prospect_id === prospectId
																			)
																		) {
																			handleUnsaveProspect(prospectId);
																		} else {
																			handleSaveProspect(item);
																		}
																	}}
																	size="sm"
																	className={
																		savedProspects.some(
																			(sp) => sp.prospect_id === item.id
																		)
																			? 'h-8 w-8 p-0 bg-gray-500 hover:bg-gray-600 text-white rounded-lg'
																			: 'h-8 w-8 p-0 bg-orange-500 hover:bg-orange-600 text-white rounded-lg'
																	}>
																	{savedProspects.some(
																		(sp) => sp.prospect_id === item.id
																	) ? (
																		<XCircle className="h-4 w-4" />
																	) : (
																		<CheckCircle className="h-4 w-4" />
																	)}
																</Button>
															</div>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
								</>
							) : !isSearching ? (
								<div className="border rounded-lg p-8 text-center">
									<div className="text-muted-foreground">
										<Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
										<p className="text-xl font-semibold mb-3">Expand Your Search</p>
										<div className="space-y-2 mb-6">
											<p className="text-base text-muted-foreground">
												No matches found with current criteria
											</p>
											<p className="text-base font-medium">
												Try our LinkedIn Extension to sync fresh jobs or adjust filters
												above
											</p>
										</div>

										{/* Extension Status */}
										{isExtensionConnected && (
											<div className="flex items-center justify-center gap-2 mb-4 text-sm text-green-600">
												<div className="w-2 h-2 bg-green-500 rounded-full"></div>
												Extension Connected
											</div>
										)}

										{/* Extension Error */}
										{extensionError && (
											<div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-600">
												{extensionError}
											</div>
										)}

										{/* Action Buttons */}
										<div className="flex flex-col items-center gap-3">
											{!isExtensionConnected ? (
												<Button
													onClick={handleAddExtension}
													disabled={isDetecting || true}
													variant="gradient"
													size="lg"
													className="flex items-center gap-2">
													<Linkedin className="h-4 w-4 text-white" />
													{isDetecting
														? 'Detecting...'
														: 'Get LinkedIn Extension (Coming Soon)'}
												</Button>
											) : (
												<Button
													onClick={() => handleSyncNow('banner')}
													disabled={isSyncing}
													variant="gradient"
													size="lg"
													className="flex items-center gap-2">
													<Linkedin className="h-4 w-4 text-white" />
													{isSyncing ? 'Syncing...' : 'Sync LinkedIn Jobs'}
												</Button>
											)}
										</div>
									</div>
								</div>
							) : null}

							{/* Pagination Controls */}
							{(data?.data?.length || 0) > 0 && !cleared && (
								<div className="flex items-center justify-center gap-2 mt-4">
									<Button
										variant="outline"
										size="sm"
										onClick={handlePrevPage}
										disabled={currentPage === 1 || isSearching}>
										Previous
									</Button>
									<span className="text-sm text-muted-foreground">
										Page {currentPage}{' '}
										{data?.metadata?.total_results &&
											`of ${Math.ceil(data.metadata.total_results / PAGE_SIZE)}`}
									</span>
									<Button
										variant="outline"
										size="sm"
										onClick={handleNextPage}
										disabled={isSearching || !hasNextPage}>
										{isSearching ? (
											<>
												<RotateCcw className="h-4 w-4 mr-2 animate-spin" />
												Loading...
											</>
										) : (
											'Next'
										)}
									</Button>
								</div>
							)}

							{/* Completed Section */}
							{completed.length > 0 && (
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<h3 className="text-lg font-semibold">
												Saved ({completed.length})
											</h3>
											<Button
												onClick={() => setShowCompleted(!showCompleted)}
												size="sm"
												variant="ghost"
												className="h-8 w-8 p-0">
												{showCompleted ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</Button>
										</div>
									</div>

									{showCompleted && (
										<div className="border rounded-lg overflow-hidden">
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead className="w-12">#</TableHead>
														<TableHead>Company Name</TableHead>
														<TableHead>Job Title</TableHead>
														<TableHead>Location</TableHead>
														<TableHead className="w-32">
															<div className="flex items-center gap-1">
																Posted On
																<Calendar className="h-3 w-3" />
															</div>
														</TableHead>
														<TableHead className="w-32">Actions</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{completed.map((item, index) => (
														<TableRow
															key={item.id}
															className="hover:bg-muted/50 h-10"
															id={index === 0 ? 'first-saved-prospect' : undefined}>
															<TableCell className="font-mono text-sm text-muted-foreground py-2">
																{index + 1}
															</TableCell>
															<TableCell className="font-medium py-2 truncate">
																{item.organization}
															</TableCell>
															<TableCell className="py-2 truncate">
																<a
																	href={item.url}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="text-orange-600 hover:text-orange-800 underline cursor-pointer">
																	{item.title}
																</a>
															</TableCell>
															<TableCell className="text-muted-foreground py-2 truncate">
																{item.locations_derived?.[0]}
															</TableCell>
															<TableCell className="text-sm text-muted-foreground py-2 truncate">
																{item.date_posted}
															</TableCell>
															<TableCell className="py-2">
																<div className="flex items-center gap-1">
																	<Button
																		onClick={() =>
																			handleUnsaveProspect(item.id?.toString())
																		}
																		size="sm"
																		variant="outline"
																		className="h-8 w-8 p-0 bg-gray-500 hover:bg-gray-600 text-white rounded-lg">
																		<XCircle className="h-4 w-4" />
																	</Button>
																</div>
															</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</div>
									)}
								</div>
							)}

							{/* Statistics */}
							<div className="text-sm text-muted-foreground">
								{searchResults.length} search results • {unapprovedProspects.length} from
								onboarding • {completed.length} saved
							</div>
						</div>

						{/* Chrome Extension Side Rail - Populated State */}
						{readyToComplete.length > 0 && (
							<ChromeExtensionSideRail
								onAddExtension={handleAddExtension}
								onSyncNow={() => handleSyncNow('side_rail')}
								isExtensionConnected={isExtensionConnected}
								isSyncing={isSyncing}
							/>
						)}
					</div>
				</Card>
			</div>

			{/* LinkedIn OAuth Modal */}
			<LinkedInOAuthModal
				isOpen={showLinkedInModal}
				onClose={() => setShowLinkedInModal(false)}
				onSuccess={handleLinkedInSuccess}
			/>
		</div>
	);
};

// Local Provider wrapper (no app-level changes needed)
const ProspectModule = (_props: ProspectModuleProps) => {
	const [client] = useState(() => new QueryClient());
	return (
		<QueryClientProvider client={client}>
			<ProspectModuleInner />
		</QueryClientProvider>
	);
};

export default ProspectModule;
