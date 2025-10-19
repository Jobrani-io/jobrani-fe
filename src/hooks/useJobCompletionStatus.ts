import { useState, useEffect } from 'react';

export interface ModuleCompletionStatus {
  prospect: boolean;
  match: boolean;
  write: boolean;
  design: boolean;
}

export interface JobCompletionData {
  jobId: string;
  completion: ModuleCompletionStatus;
  nextSteps: string[];
  readyToLaunch: boolean;
}

// Mock completion data for development
const mockCompletionData: Record<string, ModuleCompletionStatus> = {
  'job-draft-1': {
    prospect: true,
    match: false,
    write: false,
    design: false
  },
  'job-draft-2': {
    prospect: true,
    match: true,
    write: false,
    design: false
  },
  'job-draft-3': {
    prospect: true,
    match: false,
    write: false,
    design: false
  },
  'job-ready-1': {
    prospect: true,
    match: true,
    write: true,
    design: true
  },
  'job-ready-2': {
    prospect: true,
    match: true,
    write: true,
    design: true
  }
};

export const useJobCompletionStatus = (jobId?: string) => {
  const [completionData, setCompletionData] = useState<JobCompletionData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (jobId) {
      fetchCompletionStatus(jobId);
    }
  }, [jobId]);

  const fetchCompletionStatus = async (id: string) => {
    setLoading(true);
    
    try {
      // In production, this would check:
      // - linkedin_saved_jobs for prospect completion
      // - prospect_matches for match completion
      // - generated_messages for write completion
      // - user preferences for design completion
      
      const completion = mockCompletionData[id] || {
        prospect: false,
        match: false,
        write: false,
        design: false
      };

      const nextSteps = [];
      if (!completion.prospect) nextSteps.push('Save job opportunity');
      if (!completion.match) nextSteps.push('Find hiring manager');
      if (!completion.write) nextSteps.push('Generate application materials');
      if (!completion.design) nextSteps.push('Select campaign design');

      const readyToLaunch = completion.prospect && completion.match && completion.write && completion.design;

      setCompletionData({
        jobId: id,
        completion,
        nextSteps,
        readyToLaunch
      });
    } catch (error) {
      console.error('Failed to fetch completion status:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateModuleCompletion = (module: keyof ModuleCompletionStatus, completed: boolean) => {
    if (!completionData) return;

    const updatedCompletion = {
      ...completionData.completion,
      [module]: completed
    };

    const nextSteps = [];
    if (!updatedCompletion.prospect) nextSteps.push('Save job opportunity');
    if (!updatedCompletion.match) nextSteps.push('Find hiring manager');
    if (!updatedCompletion.write) nextSteps.push('Generate application materials');
    if (!updatedCompletion.design) nextSteps.push('Select campaign design');

    const readyToLaunch = updatedCompletion.prospect && updatedCompletion.match && updatedCompletion.write && updatedCompletion.design;

    setCompletionData({
      ...completionData,
      completion: updatedCompletion,
      nextSteps,
      readyToLaunch
    });
  };

  return {
    completionData,
    loading,
    updateModuleCompletion,
    refetch: () => jobId && fetchCompletionStatus(jobId)
  };
};