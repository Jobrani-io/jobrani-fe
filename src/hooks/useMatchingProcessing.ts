import { useState, useEffect, useCallback } from "react";
import { 
  matchingProcessingService, 
  MatchingProcessingStatus, 
  MatchingJobRequest 
} from "@/services/matchingProcessingService";
import { MatchService } from "@/services/savedProspectsService";

export interface UseMatchingProcessingResult {
  // Processing state
  processingJobs: MatchingProcessingStatus[];
  isProcessing: (request: MatchingJobRequest) => boolean;
  
  // Actions
  startMatching: (request: MatchingJobRequest, service: MatchService) => Promise<string>;
  startBulkMatching: (requests: MatchingJobRequest[], service: MatchService) => Promise<string[]>;
  cleanup: (processingId: string) => void;
  cleanupCompleted: () => void;
  
  // Status helpers
  getMatchesForProspect: (prospectId: string) => MatchingProcessingStatus | undefined;
  getProcessingStatus: (prospectId: string) => 'idle' | 'processing' | 'completed' | 'error';
  getProgress: (prospectId: string) => number;
}

export function useMatchingProcessing(): UseMatchingProcessingResult {
  const [processingJobs, setProcessingJobs] = useState<MatchingProcessingStatus[]>([]);

  // Subscribe to processing updates
  useEffect(() => {
    const unsubscribe = matchingProcessingService.subscribe((status) => {
      setProcessingJobs(prev => {
        const existing = prev.find(job => job.id === status.id);
        if (existing) {
          // Update existing job
          return prev.map(job => job.id === status.id ? status : job);
        } else {
          // Add new job
          return [...prev, status];
        }
      });
    });

    // Load initial state
    setProcessingJobs(matchingProcessingService.getAllJobs());

    return unsubscribe;
  }, []);

  const isProcessing = useCallback((request: MatchingJobRequest) => {
    return matchingProcessingService.isProcessing(request);
  }, []);

  const startMatching = useCallback(async (request: MatchingJobRequest, service: MatchService) => {
    return matchingProcessingService.startProcessing(request, service);
  }, []);

  const startBulkMatching = useCallback(async (requests: MatchingJobRequest[], service: MatchService) => {
    return matchingProcessingService.startBulkProcessing(requests, service);
  }, []);

  const cleanup = useCallback((processingId: string) => {
    matchingProcessingService.cleanup(processingId);
    setProcessingJobs(prev => prev.filter(job => job.id !== processingId));
  }, []);

  const cleanupCompleted = useCallback(() => {
    matchingProcessingService.cleanupCompleted();
    setProcessingJobs(prev => prev.filter(job => 
      job.status !== 'completed' && job.status !== 'error'
    ));
  }, []);

  const getMatchesForProspect = useCallback((prospectId: string) => {
    return processingJobs.find(job => 
      job.prospectId === prospectId && job.status === 'completed'
    );
  }, [processingJobs]);

  const getProcessingStatus = useCallback((prospectId: string): 'idle' | 'processing' | 'completed' | 'error' => {
    const job = processingJobs.find(job => job.prospectId === prospectId);
    if (!job) return 'idle';
    
    if (job.status === 'pending' || job.status === 'processing') return 'processing';
    return job.status;
  }, [processingJobs]);

  const getProgress = useCallback((prospectId: string): number => {
    const job = processingJobs.find(job => job.prospectId === prospectId);
    return job?.progress || 0;
  }, [processingJobs]);

  return {
    processingJobs,
    isProcessing,
    startMatching,
    startBulkMatching,
    cleanup,
    cleanupCompleted,
    getMatchesForProspect,
    getProcessingStatus,
    getProgress,
  };
}