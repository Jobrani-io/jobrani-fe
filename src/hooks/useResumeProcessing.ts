import { useState, useEffect, useCallback } from "react";
import {
  resumeProcessingService,
  ResumeProcessingStatus,
} from "@/services/resumeProcessingService";

export const useResumeProcessing = () => {
  const [processingJobs, setProcessingJobs] = useState<
    ResumeProcessingStatus[]
  >([]);
  const [activeProcessingId, setActiveProcessingId] = useState<string | null>(
    null
  );

  useEffect(() => {
    // Initialize with existing jobs
    setProcessingJobs(resumeProcessingService.getAllJobs());

    // Subscribe to updates
    const unsubscribe = resumeProcessingService.subscribe((status) => {
      setProcessingJobs(resumeProcessingService.getAllJobs());
    });

    return unsubscribe;
  }, []);

  const startProcessing = useCallback(async (file: File): Promise<string> => {
    const processingId = await resumeProcessingService.startProcessing(file);
    setActiveProcessingId(processingId);
    return processingId;
  }, []);

  const getActiveProcessing = useCallback(():
    | ResumeProcessingStatus
    | undefined => {
    if (!activeProcessingId) return undefined;
    return resumeProcessingService.getStatus(activeProcessingId);
  }, [activeProcessingId]);

  const clearActiveProcessing = useCallback(() => {
    setActiveProcessingId(null);
  }, []);

  const canNavigateEarly = useCallback(
    async (processingId: string): Promise<boolean> => {
      return resumeProcessingService.canNavigateEarly(processingId);
    },
    []
  );

  const cleanup = useCallback(
    (processingId: string) => {
      resumeProcessingService.cleanup(processingId);
      if (activeProcessingId === processingId) {
        setActiveProcessingId(null);
      }
    },
    [activeProcessingId]
  );

  return {
    processingJobs,
    activeProcessingId,
    activeProcessing: getActiveProcessing(),
    startProcessing,
    clearActiveProcessing,
    canNavigateEarly,
    cleanup,
  };
};
