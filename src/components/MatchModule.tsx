import ApprovedJobsTable from "@/components/match/ApprovedJobsTable";
import ContactSelectionModal from "@/components/match/ContactSelectionModal";
import JobMatchTable from "@/components/match/JobMatchTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { unifiedMatchDataService } from "@/data/unifiedMockData";

import { useGlobalMockData } from "@/hooks/useGlobalMockData";
import savedProspectsService, {
  JobMatch,
  PreferredMatch,
  SavedProspect,
  MatchService,
} from "@/services/savedProspectsService";
import matchCacheService from "@/services/matchCacheService";
import { useMatchingProcessing } from "@/hooks/useMatchingProcessing";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Eye, EyeOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import usePersistedState, { validators } from "@/hooks/usePersistedState";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface EnhancedJobOpportunity {
  enhancedContacts?: JobMatch[];
  autoSelectedContact?: JobMatch | null;
  isApproved?: boolean;
  prospect_id: string;
  company: string;
  job_title: string;
  location: string;
  created_at?: string;
  updated_at?: string;
  user_id: string;
  id: string;
  posted_on: string;
  saved_date: string;
  employment_type: string;
  is_remote: boolean;
}

interface MatchModuleProps {
  triggerWaitlistPopup?: () => void;
}

const MatchModule = ({ triggerWaitlistPopup }: MatchModuleProps) => {
  // Use global mock data state
  const { useMockData } = useGlobalMockData();

  // Background processing hook
  const {
    processingJobs,
    isProcessing,
    startMatching,
    startBulkMatching,
    cleanupCompleted,
  } = useMatchingProcessing();

  // Persisted matching state
  const [approvedJobsArray, setApprovedJobsArray] = usePersistedState({
    key: "matchModule-approvedJobs",
    defaultValue: [] as string[],
    expirationHours: 24, // Expire after 24 hours
    validator: validators.isArray,
  });

  const [rejectedJobsArray, setRejectedJobsArray] = usePersistedState({
    key: "matchModule-rejectedJobs",
    defaultValue: [] as string[],
    expirationHours: 24,
    validator: validators.isArray,
  });

  const [pendingSelectionsArray, setPendingSelectionsArray] = usePersistedState(
    {
      key: "matchModule-pendingSelections",
      defaultValue: [] as Array<[string, JobMatch]>,
      expirationHours: 24,
      validator: validators.isArray,
    }
  );

  const [showApproved, setShowApproved] = usePersistedState({
    key: "matchModule-showApproved",
    defaultValue: true,
  });

  // Convert persisted arrays to Sets/Maps for component state
  const [approvedJobs, setApprovedJobs] = useState<Set<string>>(
    new Set(approvedJobsArray)
  );
  const [rejectedJobs, setRejectedJobs] = useState<Set<string>>(
    new Set(rejectedJobsArray)
  );
  const [pendingSelections, setPendingSelections] = useState<
    Map<string, JobMatch>
  >(new Map(pendingSelectionsArray));

  // Non-persisted state (loads fresh each time)
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedJobForContact, setSelectedJobForContact] =
    useState<SavedProspect | null>(null);
  const [savedProspects, setSavedProspects] = useState<SavedProspect[]>([]);
  const [jobMatches, setJobMatches] = useState<Map<string, JobMatch[]>>(
    new Map()
  );
  const [isLoadingMatches, setIsLoadingMatches] = useState<Set<string>>(
    new Set()
  );
  const [preferredMatches, setPreferredMatches] = useState<
    Map<string, PreferredMatch>
  >(new Map());

  const { isLimitReached } = useSubscription();

  // Sync Sets/Maps with persisted arrays when they change
  useEffect(() => {
    setApprovedJobsArray(Array.from(approvedJobs));
  }, [approvedJobs, setApprovedJobsArray]);

  useEffect(() => {
    setRejectedJobsArray(Array.from(rejectedJobs));
  }, [rejectedJobs, setRejectedJobsArray]);

  useEffect(() => {
    setPendingSelectionsArray(Array.from(pendingSelections.entries()));
  }, [pendingSelections, setPendingSelectionsArray]);

  // Sync background processing results with jobMatches state
  useEffect(() => {
    processingJobs.forEach(job => {
      if (job.status === 'completed' && job.matches) {
        setJobMatches(prev => {
          const next = new Map(prev);
          next.set(job.prospectId, job.matches!);
          return next;
        });

        // Remove from loading state
        setIsLoadingMatches(prev => {
          const next = new Set(prev);
          next.delete(job.prospectId);
          return next;
        });
      }
    });
  }, [processingJobs]);

  const loadSavedProspects = useCallback(async () => {
      // Clear expired cache entries when component mounts
      if (!useMockData) {
        matchCacheService.clearExpiredCache();
      }

      const service = useMockData
        ? unifiedMatchDataService
        : savedProspectsService;
      const prospects = await service.getSavedProspects();

      const savedProspectsWithCompanyUrl = prospects.filter(
        (prospect) => prospect.company_url
      );

      setSavedProspects(savedProspectsWithCompanyUrl);

      if (!useMockData) {
        if (isLimitReached("prospects_found")) return;
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const cachedMatches = matchCacheService.getAllCachedMatches(user.id);
          setJobMatches(cachedMatches);
          console.log(`Loaded ${cachedMatches.size} cached match results`);

          // Only mark uncached prospects as loading
          const uncachedProspects = savedProspectsWithCompanyUrl.filter(
            (prospect) => !cachedMatches.has(prospect.prospect_id)
          );

          setIsLoadingMatches(
            new Set(uncachedProspects.map((p) => p.prospect_id))
          );

          console.log(
            `${cachedMatches.size} prospects loaded from cache, ${uncachedProspects.length} need API calls`
          );
        } else {
          // No user, mark all as loading
          setIsLoadingMatches(
            new Set(savedProspectsWithCompanyUrl.map((p) => p.prospect_id))
          );
        }
      } else {
        // For mock data, mark all as loading
        setIsLoadingMatches(
          new Set(savedProspectsWithCompanyUrl.map((p) => p.prospect_id))
        );
      }

      if (useMockData) {
        // For mock data, use the old individual approach
        prospects.forEach(async (prospect) => {
          try {
            // preferred + matches fetched in parallel for this job
            const [preferredRes, matchesRes] = await Promise.allSettled([
              service.getPreferredMatch(prospect.prospect_id),
              service.getJobMatches(
                prospect.prospect_id,
                prospect.company,
                prospect.job_title,
                prospect.location || undefined
              ),
            ]);

            if (preferredRes.status === "fulfilled" && preferredRes.value) {
              setPreferredMatches((prev) => {
                const next = new Map(prev);
                next.set(prospect.prospect_id, preferredRes.value);
                return next;
              });
            }

            if (
              matchesRes.status === "fulfilled" &&
              Array.isArray(matchesRes.value) &&
              matchesRes.value.length > 0
            ) {
              setJobMatches((prev) => {
                const next = new Map(prev);
                next.set(prospect.prospect_id, matchesRes.value);
                return next;
              });
            }
          } finally {
            // Clear loading for this specific job row
            setIsLoadingMatches((prev) => {
              const next = new Set(prev);
              next.delete(prospect.prospect_id);
              return next;
            });
          }
        });
      } else {
        // For live data, use background processing
        try {
          // First, get all preferred matches in parallel
          const preferredPromises = savedProspectsWithCompanyUrl.map(
            (prospect) => service.getPreferredMatch(prospect.prospect_id)
          );
          const preferredResults = await Promise.allSettled(preferredPromises);

          // Update preferred matches
          preferredResults.forEach((result, index) => {
            if (result.status === "fulfilled" && result.value) {
              setPreferredMatches((prev) => {
                const next = new Map(prev);
                next.set(prospects[index].prospect_id, result.value);
                return next;
              });
            }
          });

          // Start background processing for all prospects
          const matchingRequests = savedProspectsWithCompanyUrl.map(prospect => ({
            prospectId: prospect.prospect_id,
            company: prospect.company_url || prospect.company,
            jobTitle: prospect.job_title,
            location: prospect.location || undefined,
          }));

          // Start bulk background processing
          if (matchingRequests.length > 0) {
            console.log(`Starting background processing for ${matchingRequests.length} prospects`);
            await startBulkMatching(matchingRequests, service as MatchService);
          }

        } catch (error) {
          console.error("Error loading prospects:", error);
        } finally {
          // Clear all loading states for cached items only
          // Background processing will handle clearing loading states for uncached items
          setIsLoadingMatches(new Set());
        }
      }
  }, [useMockData, startBulkMatching]);

  useEffect(() => {
    loadSavedProspects();
  }, [loadSavedProspects]);

  // Cleanup completed background jobs periodically
  useEffect(() => {
    const interval = setInterval(() => {
      cleanupCompleted();
    }, 30000); // Clean up every 30 seconds

    return () => clearInterval(interval);
  }, [cleanupCompleted]);

  // Keep UI "approved" in sync with DB preferreds at all times
  useEffect(() => {
    setApprovedJobs(new Set(Array.from(preferredMatches.keys())));
  }, [preferredMatches]);

  // Per-job match generation — keep it independent
  const handleMatchProspect = async (prospect: SavedProspect) => {
    const request = {
      prospectId: prospect.prospect_id,
      company: prospect.company,
      jobTitle: prospect.job_title,
      location: prospect.location || undefined,
    };

    // Check if already processing this request
    if (isProcessing(request)) return;
    if (isLimitReached("prospects_found")) return;

    setIsLoadingMatches((prev) => new Set([...prev, prospect.prospect_id]));
    
    try {
      const service = useMockData
        ? unifiedMatchDataService
        : savedProspectsService;

      if (useMockData) {
        // For mock data, use individual API (not background processing)
        const matches = await service.getJobMatches(
          prospect.prospect_id,
          prospect.company,
          prospect.job_title,
          prospect.location || undefined
        );
        setJobMatches(
          (prev) => new Map(prev.set(prospect.prospect_id, matches))
        );
        
        setIsLoadingMatches((prev) => {
          const next = new Set(prev);
          next.delete(prospect.prospect_id);
          return next;
        });
      } else {
        // For live data, use background processing
        await startMatching(request, service as MatchService);
        // Loading state will be cleared by the background processing effect
      }
    } catch (error) {
      console.error("Error matching prospect:", error);
      setIsLoadingMatches((prev) => {
        const next = new Set(prev);
        next.delete(prospect.prospect_id);
        return next;
      });
    }
  };

  // Enhanced loading state that includes background processing
  const enhancedIsLoadingMatches = useMemo(() => {
    const loadingSet = new Set(isLoadingMatches);
    
    // Add prospects that are being processed in background
    processingJobs.forEach(job => {
      if (job.status === 'pending' || job.status === 'processing') {
        loadingSet.add(job.prospectId);
      }
    });
    
    return loadingSet;
  }, [isLoadingMatches, processingJobs]);

  // Build display rows: preferred > pending > best-of-matches
  const processedJobs = useMemo((): EnhancedJobOpportunity[] => {
    return savedProspects.map((prospect) => {
      const matches = jobMatches.get(prospect.prospect_id) || [];
      const preferred = preferredMatches.get(
        prospect.prospect_id
      )?.selected_match;
      const pending = pendingSelections.get(prospect.prospect_id);

      let display: JobMatch | null = null;
      if (preferred) display = preferred;
      else if (pending) display = pending;
      else if (matches.length > 0) {
        display = matches.reduce((a, b) =>
          b.confidence > a.confidence ? b : a
        );
      }

      return {
        ...prospect,
        enhancedContacts: matches,
        autoSelectedContact: display,
        isApproved: !!preferred,
        posted_on: prospect.posted_on || "",
        saved_date: prospect.saved_date || "",
        location: prospect.location || "",
      } as EnhancedJobOpportunity;
    });
  }, [savedProspects, jobMatches, preferredMatches, pendingSelections]);

  // Approve persists (uses pending if present, else best)
  const handleApproveJob = async (prospectId: string) => {
    const matches = jobMatches.get(prospectId) || [];
    if (matches.length === 0 && !pendingSelections.get(prospectId)) return;

    const pending = pendingSelections.get(prospectId);
    const best = matches.length
      ? matches.reduce((a, b) => (b.confidence > a.confidence ? b : a))
      : null;

    const toSave = pending ?? best;
    if (!toSave) return;

    const service = useMockData
      ? unifiedMatchDataService
      : savedProspectsService;
    const preferred = await service.setPreferredMatch(prospectId, toSave);
    if (preferred) {
      setPreferredMatches((prev) => new Map(prev.set(prospectId, preferred)));
      setApprovedJobs((prev) => new Set([...prev, prospectId]));
      setRejectedJobs((prev) => {
        const next = new Set(prev);
        next.delete(prospectId);
        return next;
      });
      // clear draft now that we approved
      setPendingSelections((prev) => {
        const next = new Map(prev);
        next.delete(prospectId);
        return next;
      });

    }
  };

  const handleRejectJob = async (prospectId: string) => {
    setRejectedJobs((prev) => new Set([...prev, prospectId]));
    setApprovedJobs((prev) => {
      const next = new Set(prev);
      next.delete(prospectId);
      return next;
    });
    // also clear any draft selection
    setPendingSelections((prev) => {
      const next = new Map(prev);
      next.delete(prospectId);
      return next;
    });
  };

  const handleChangeContact = async (prospectId: string) => {
    const job = savedProspects.find((j) => j.prospect_id === prospectId);
    if (job) {
      setSelectedJobForContact(job);
      setContactModalOpen(true);
    }
  };

  // EDIT now only sets a draft, does NOT persist
  const handleSelectContact = async (prospectId: string, contact: JobMatch) => {
    setPendingSelections((prev) => new Map(prev.set(prospectId, contact)));
    // no DB write here anymore
  };

  const handleMatchesUpdated = async () => {
    if (!selectedJobForContact) return;

    // Clear cache to force refresh and fetch fresh matches from database
    if (!useMockData) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        matchCacheService.clearCachedMatches({
          jobId: selectedJobForContact.prospect_id,
          company: selectedJobForContact.company,
          jobTitle: selectedJobForContact.job_title,
          location: selectedJobForContact.location,
          userId: user.id,
        });
      }
    }

    // Refresh the matches for the current job in parent component
    const service = useMockData
      ? unifiedMatchDataService
      : savedProspectsService;
    try {
      // For live data, we directly query prospect_matches table to get all matches including custom ones
      if (!useMockData) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: existingMatch, error } = await supabase
            .from("prospect_matches")
            .select("matches")
            .eq("job_id", selectedJobForContact.prospect_id)
            .eq("user_id", user.id)
            .single();

          if (error && error.code !== "PGRST116") {
            throw error;
          }

          const existingMatches =
            (existingMatch?.matches as unknown as JobMatch[]) || [];
          setJobMatches((prev) => {
            const next = new Map(prev);
            next.set(selectedJobForContact.prospect_id, existingMatches);
            return next;
          });
        }
      } else {
        // For mock data, use the service method
        const matches = await service.getJobMatches(
          selectedJobForContact.prospect_id,
          selectedJobForContact.company,
          selectedJobForContact.job_title,
          selectedJobForContact.location || undefined
        );

        setJobMatches((prev) => {
          const next = new Map(prev);
          next.set(selectedJobForContact.prospect_id, matches);
          return next;
        });
      }
    } catch (error) {
      console.error("Error refreshing matches:", error);
    }
  };

  const handleBulkApprove = async (prospectIds: string[]) => {
    for (const prospectId of prospectIds) {
      // sequential approval is fine here
      // uses pending selection when present
      await handleApproveJob(prospectId);
    }
  };


  const handleUnapproveJob = async (prospectId: string) => {
    const service = useMockData
      ? unifiedMatchDataService
      : savedProspectsService;
    const success = await service.removePreferredMatch(prospectId);
    if (success) {
      setPreferredMatches((prev) => {
        const next = new Map(prev);
        next.delete(prospectId);
        return next;
      });
      setApprovedJobs((prev) => {
        const next = new Set(prev);
        next.delete(prospectId);
        return next;
      });
    }
  };

  const handleToggleApproved = () => {
    setShowApproved(!showApproved);
  };


  // Split jobs into approved and unapproved
  const unapprovedJobs = processedJobs.filter(
    (job) =>
      !rejectedJobs.has(job.prospect_id) && !approvedJobs.has(job.prospect_id)
  );

  const approvedJobsList = processedJobs.filter(
    (job) =>
      !rejectedJobs.has(job.prospect_id) && approvedJobs.has(job.prospect_id)
  );

  // Only reset persisted state when explicitly switching between mock/live modes
  // This prevents clearing approvals on every component mount
  const [previousMockDataState, setPreviousMockDataState] =
    useState(useMockData);

  useEffect(() => {
    // Only clear when actually switching modes, not on initial mount
    if (previousMockDataState !== useMockData) {
      // Reset state when switching modes
      setSavedProspects([]);
      setJobMatches(new Map());
      setPreferredMatches(new Map());
      setApprovedJobs(new Set());
      setRejectedJobs(new Set());
      setPendingSelections(new Map());
      setIsLoadingMatches(new Set());

      // Clear persisted state when switching modes
      setApprovedJobsArray([]);
      setRejectedJobsArray([]);
      setPendingSelectionsArray([]);

      setPreviousMockDataState(useMockData);
    }
  }, [
    useMockData,
    previousMockDataState,
    setApprovedJobsArray,
    setRejectedJobsArray,
    setPendingSelectionsArray,
  ]);

  return (
    <div className="w-full space-y-6">
      {/* Unapproved Jobs Table */}
      {processedJobs.length > 0 ? (
        <div className="space-y-6" id="approved-jobs-section">
          <JobMatchTable
            jobs={savedProspects.filter(
              (p) => !approvedJobs.has(p.prospect_id)
            )}
            enhancedJobs={unapprovedJobs}
            approvedJobs={approvedJobs}
            onApproveJob={handleApproveJob}
            onRejectJob={handleRejectJob}
            onChangeContact={handleChangeContact}
            onBulkApprove={handleBulkApprove}
            onMatchProspect={handleMatchProspect}
            isLoadingMatches={enhancedIsLoadingMatches}
          />

          {/* Show Approved Button */}
          {approvedJobsList.length > 0 && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleToggleApproved}
                className="gap-2"
              >
                {showApproved ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                {showApproved ? "Hide" : "Show"} Approved (
                {approvedJobsList.length})
              </Button>
            </div>
          )}

          {/* Approved Jobs Section */}
          {showApproved && approvedJobsList.length > 0 && (
            <div>
              <ApprovedJobsTable
                approvedJobs={approvedJobsList}
                onUnapproveJob={handleUnapproveJob}
              />
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-medium mb-2">No Jobs Available</h3>
            <p className="text-muted-foreground">
              No job opportunities found to match.
            </p>
          </CardContent>
        </Card>
      )}
      {/* Modals */}
      <ContactSelectionModal
        isOpen={contactModalOpen}
        onClose={() => {
          setContactModalOpen(false);
          setSelectedJobForContact(null);
        }}
        job={selectedJobForContact}
        onSelectContact={handleSelectContact}
        onMatchesUpdated={handleMatchesUpdated}
      />
    </div>
  );
};

export default MatchModule;
