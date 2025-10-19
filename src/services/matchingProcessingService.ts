import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { JobMatch, MatchService } from "./savedProspectsService";
import matchCacheService from "./matchCacheService";

export interface MatchingProcessingStatus {
  id: string;
  prospectId: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  error?: string;
  matches?: JobMatch[];
  company: string;
  jobTitle: string;
  location?: string;
}

export interface MatchingJobRequest {
  prospectId: string;
  company: string;
  jobTitle: string;
  location?: string;
}

export class MatchingProcessingService {
  private static instance: MatchingProcessingService;
  private processingJobs = new Map<string, MatchingProcessingStatus>();
  private listeners = new Set<(status: MatchingProcessingStatus) => void>();
  private activeRequests = new Set<string>(); // Track active requests to prevent duplicates

  static getInstance(): MatchingProcessingService {
    if (!MatchingProcessingService.instance) {
      MatchingProcessingService.instance = new MatchingProcessingService();
    }
    return MatchingProcessingService.instance;
  }

  private constructor() {}

  private generateRequestKey(request: MatchingJobRequest): string {
    return `${request.prospectId}_${request.company}_${request.jobTitle}_${request.location || ''}`;
  }

  // Check if a request is already in progress
  isProcessing(request: MatchingJobRequest): boolean {
    const key = this.generateRequestKey(request);
    return this.activeRequests.has(key);
  }

  // Start background processing of matches
  async startProcessing(request: MatchingJobRequest, service: MatchService): Promise<string> {
    const requestKey = this.generateRequestKey(request);
    
    // Check if already processing this exact request
    if (this.activeRequests.has(requestKey)) {
      console.log(`Already processing matches for ${request.prospectId}`);
      // Return existing processing ID if found
      for (const [id, status] of this.processingJobs.entries()) {
        if (status.prospectId === request.prospectId && status.status === 'processing') {
          return id;
        }
      }
    }

    // Check cache first
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const cachedMatches = matchCacheService.getCachedMatches({
        jobId: request.prospectId,
        company: request.company,
        jobTitle: request.jobTitle,
        location: request.location,
        userId: user.id,
      });

      if (cachedMatches) {
        console.log(`Returning cached matches for ${request.prospectId}`);
        // Return cached result immediately
        const processingId = `match_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        const status: MatchingProcessingStatus = {
          id: processingId,
          prospectId: request.prospectId,
          status: 'completed',
          progress: 100,
          matches: cachedMatches,
          company: request.company,
          jobTitle: request.jobTitle,
          location: request.location,
        };
        
        this.processingJobs.set(processingId, status);
        this.notifyListeners(status);
        return processingId;
      }
    }

    const processingId = `match_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    const status: MatchingProcessingStatus = {
      id: processingId,
      prospectId: request.prospectId,
      status: 'pending',
      progress: 0,
      company: request.company,
      jobTitle: request.jobTitle,
      location: request.location,
    };

    this.processingJobs.set(processingId, status);
    this.activeRequests.add(requestKey);
    this.notifyListeners(status);

    // Start processing in background
    this.processMatchesInBackground(processingId, request, service, requestKey);
    
    return processingId;
  }

  // Start bulk processing for multiple requests
  async startBulkProcessing(requests: MatchingJobRequest[], service: MatchService): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Authentication required");
    }

    // Filter out already processing and cached requests
    const uncachedRequests = requests.filter(request => {
      const requestKey = this.generateRequestKey(request);
      if (this.activeRequests.has(requestKey)) {
        return false;
      }

      const cachedMatches = matchCacheService.getCachedMatches({
        jobId: request.prospectId,
        company: request.company,
        jobTitle: request.jobTitle,
        location: request.location,
        userId: user.id,
      });

      return !cachedMatches;
    });

    if (uncachedRequests.length === 0) {
      console.log("All requests are already cached or processing");
      return [];
    }

    console.log(`Starting bulk processing for ${uncachedRequests.length} uncached requests`);

    const processingIds: string[] = [];

    // Mark all requests as processing
    uncachedRequests.forEach(request => {
      const requestKey = this.generateRequestKey(request);
      const processingId = `bulk_match_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      
      const status: MatchingProcessingStatus = {
        id: processingId,
        prospectId: request.prospectId,
        status: 'pending',
        progress: 0,
        company: request.company,
        jobTitle: request.jobTitle,
        location: request.location,
      };

      this.processingJobs.set(processingId, status);
      this.activeRequests.add(requestKey);
      this.notifyListeners(status);
      processingIds.push(processingId);
    });

    // Start bulk processing in background
    this.processBulkMatchesInBackground(uncachedRequests, service, processingIds);

    return processingIds;
  }

  private async processMatchesInBackground(
    processingId: string, 
    request: MatchingJobRequest, 
    service: MatchService,
    requestKey: string
  ) {
    try {
      // Update to processing status
      this.updateStatus(processingId, { status: 'processing', progress: 10 });

      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Authentication required");
      }

      this.updateStatus(processingId, { progress: 30 });

      // Call the matching service
      const bulkMatches = await service.getBulkJobMatches([{
        prospectId: request.prospectId,
        company: request.company,
        jobTitle: request.jobTitle,
        location: request.location,
      }]);

      this.updateStatus(processingId, { progress: 80 });

      const matches = bulkMatches.get(request.prospectId) || [];

      // Cache the results
      matchCacheService.cacheMatches({
        jobId: request.prospectId,
        company: request.company,
        jobTitle: request.jobTitle,
        location: request.location,
        userId: user.id,
      }, matches);

      // Complete processing
      this.updateStatus(processingId, {
        status: 'completed',
        progress: 100,
        matches,
      });

    } catch (error) {
      console.error("Error processing matches in background:", error);
      
      this.updateStatus(processingId, {
        status: 'error',
        error: error instanceof Error ? error.message : "Unknown error occurred"
      });

      // Show error notification
      toast({
        title: "Match processing failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      // Remove from active requests
      this.activeRequests.delete(requestKey);
    }
  }

  private async processBulkMatchesInBackground(
    requests: MatchingJobRequest[], 
    service: MatchService,
    processingIds: string[]
  ) {
    try {
      // Update all to processing status
      processingIds.forEach(id => {
        this.updateStatus(id, { status: 'processing', progress: 10 });
      });

      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Authentication required");
      }

      // Update progress
      processingIds.forEach(id => {
        this.updateStatus(id, { progress: 30 });
      });

      // Call the bulk matching service
      const bulkMatches = await service.getBulkJobMatches(requests.map(request => ({
        prospectId: request.prospectId,
        company: request.company,
        jobTitle: request.jobTitle,
        location: request.location,
      })));

      // Update progress
      processingIds.forEach(id => {
        this.updateStatus(id, { progress: 80 });
      });

      // Process results for each request
      requests.forEach((request, index) => {
        const processingId = processingIds[index];
        const matches = bulkMatches.get(request.prospectId) || [];

        // Cache the results
        matchCacheService.cacheMatches({
          jobId: request.prospectId,
          company: request.company,
          jobTitle: request.jobTitle,
          location: request.location,
          userId: user.id,
        }, matches);

        // Complete processing
        this.updateStatus(processingId, {
          status: 'completed',
          progress: 100,
          matches,
        });

        // Remove from active requests
        const requestKey = this.generateRequestKey(request);
        this.activeRequests.delete(requestKey);
      });

    } catch (error) {
      console.error("Error processing bulk matches in background:", error);
      
      // Mark all as error
      processingIds.forEach(id => {
        this.updateStatus(id, {
          status: 'error',
          error: error instanceof Error ? error.message : "Unknown error occurred"
        });
      });

      // Clear active requests
      requests.forEach(request => {
        const requestKey = this.generateRequestKey(request);
        this.activeRequests.delete(requestKey);
      });

      // Show error notification
      toast({
        title: "Bulk match processing failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  }

  private updateStatus(processingId: string, updates: Partial<MatchingProcessingStatus>) {
    const current = this.processingJobs.get(processingId);
    if (!current) return;

    const updated = { ...current, ...updates };
    this.processingJobs.set(processingId, updated);
    this.notifyListeners(updated);
  }

  private notifyListeners(status: MatchingProcessingStatus) {
    this.listeners.forEach(listener => listener(status));
  }

  // Subscribe to processing status updates
  subscribe(listener: (status: MatchingProcessingStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Get current status of a processing job
  getStatus(processingId: string): MatchingProcessingStatus | undefined {
    return this.processingJobs.get(processingId);
  }

  // Get all processing jobs
  getAllJobs(): MatchingProcessingStatus[] {
    return Array.from(this.processingJobs.values());
  }

  // Get all processing jobs for a specific prospect
  getJobsForProspect(prospectId: string): MatchingProcessingStatus[] {
    return Array.from(this.processingJobs.values()).filter(
      job => job.prospectId === prospectId
    );
  }

  // Check if we can allow early navigation (no errors in first 5 seconds)
  async canNavigateEarly(processingId: string): Promise<boolean> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        const status = this.getStatus(processingId);
        // Allow navigation if still processing or completed (no error)
        resolve(status ? status.status !== 'error' : false);
      }, 5000); // 5 second timeout

      // If it completes or errors before 5 seconds, resolve immediately
      const unsubscribe = this.subscribe((status) => {
        if (status.id === processingId && (status.status === 'completed' || status.status === 'error')) {
          clearTimeout(timeout);
          unsubscribe();
          resolve(status.status !== 'error');
        }
      });
    });
  }

  // Clean up completed or errored jobs
  cleanup(processingId: string) {
    const status = this.processingJobs.get(processingId);
    if (status) {
      const requestKey = this.generateRequestKey({
        prospectId: status.prospectId,
        company: status.company,
        jobTitle: status.jobTitle,
        location: status.location,
      });
      this.activeRequests.delete(requestKey);
    }
    this.processingJobs.delete(processingId);
  }

  // Clean up all completed or errored jobs
  cleanupCompleted() {
    for (const [id, status] of this.processingJobs.entries()) {
      if (status.status === 'completed' || status.status === 'error') {
        this.cleanup(id);
      }
    }
  }
}

export const matchingProcessingService = MatchingProcessingService.getInstance();