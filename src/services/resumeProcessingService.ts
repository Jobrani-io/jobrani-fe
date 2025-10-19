import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface ResumeProcessingStatus {
  id: string;
  status: "pending" | "processing" | "completed" | "error";
  fileName: string;
  progress?: number;
  error?: string;
  resumeId?: number;
  highlights?: string[];
}

export class ResumeProcessingService {
  private static instance: ResumeProcessingService;
  private processingJobs = new Map<string, ResumeProcessingStatus>();
  private listeners = new Set<(status: ResumeProcessingStatus) => void>();

  static getInstance(): ResumeProcessingService {
    if (!ResumeProcessingService.instance) {
      ResumeProcessingService.instance = new ResumeProcessingService();
    }
    return ResumeProcessingService.instance;
  }

  private constructor() {}

  // Start background processing of a resume
  async startProcessing(file: File): Promise<string> {
    const processingId = `resume_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const status: ResumeProcessingStatus = {
      id: processingId,
      status: "pending",
      fileName: file.name,
      progress: 0,
    };

    this.processingJobs.set(processingId, status);
    this.notifyListeners(status);

    // Start processing in background
    this.processResumeInBackground(processingId, file);

    return processingId;
  }

  private async processResumeInBackground(processingId: string, file: File) {
    try {
      // Update to processing status
      this.updateStatus(processingId, { status: "processing", progress: 10 });

      // Check authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Authentication required");
      }

      this.updateStatus(processingId, { progress: 30 });

      // Prepare and upload file
      const formData = new FormData();
      formData.append("file", file);

      this.updateStatus(processingId, { progress: 50 });

      // Call the resume processing function
      const response = await supabase.functions.invoke("process-resume", {
        body: formData,
      });

      if (response.error) {
        // Handle specific error types for better user experience
        const errorMessage = response.error.message || "Failed to process resume";
        
        if (errorMessage.includes("already exists")) {
          throw new Error("This resume file has already been processed. Please try uploading again.");
        } else if (errorMessage.includes("AI")) {
          throw new Error("AI processing failed. Please check your resume format and try again.");
        }
        
        throw new Error(errorMessage);
      }

      this.updateStatus(processingId, { progress: 80 });

      const { highlights, resumeId } = response.data;
      const highlightsArray =
        highlights?.split("\n").filter((h: string) => h.trim()) || [];

      // Complete processing
      this.updateStatus(processingId, {
        status: "completed",
        progress: 100,
        resumeId,
        highlights: highlightsArray,
      });

      // Show success notification
      toast({
        title: "Resume processing complete!",
        description: `Successfully extracted ${highlightsArray.length} key highlights.`,
      });
    } catch (error) {
      console.error("Error processing resume in background:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

      this.updateStatus(processingId, {
        status: "error",
        error: errorMessage,
      });

      // Show specific error notification based on error type
      let title = "Resume processing failed";
      let description = errorMessage;
      
      if (errorMessage.includes("already exists")) {
        title = "Duplicate file detected";
        description = "This resume was already processed. Please try uploading again.";
      } else if (errorMessage.includes("AI")) {
        title = "AI processing error";
        description = "Unable to extract highlights from your resume. Please check the file format and try again.";
      } else if (errorMessage.includes("Authentication")) {
        title = "Authentication required";
        description = "Please log in to process your resume.";
      }

      toast({
        title,
        description,
        variant: "destructive",
      });
    }
  }

  private updateStatus(
    processingId: string,
    updates: Partial<ResumeProcessingStatus>
  ) {
    const current = this.processingJobs.get(processingId);
    if (!current) return;

    const updated = { ...current, ...updates };
    this.processingJobs.set(processingId, updated);
    this.notifyListeners(updated);
  }

  private notifyListeners(status: ResumeProcessingStatus) {
    this.listeners.forEach((listener) => listener(status));
  }

  // Subscribe to processing status updates
  subscribe(listener: (status: ResumeProcessingStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Get current status of a processing job
  getStatus(processingId: string): ResumeProcessingStatus | undefined {
    return this.processingJobs.get(processingId);
  }

  // Get all processing jobs
  getAllJobs(): ResumeProcessingStatus[] {
    return Array.from(this.processingJobs.values());
  }

  // Check if we can allow early navigation (allow immediately after upload starts)
  async canNavigateEarly(processingId: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Allow navigation immediately after upload starts
      const status = this.getStatus(processingId);
      if (status && status.status !== "error") {
        resolve(true);
        return;
      }

      // If status is not available yet, wait for any status update
      const unsubscribe = this.subscribe((status) => {
        if (status.id === processingId) {
          unsubscribe();
          resolve(status.status !== "error");
        }
      });
    });
  }

  // Clean up completed or errored jobs
  cleanup(processingId: string) {
    this.processingJobs.delete(processingId);
  }
}

export const resumeProcessingService = ResumeProcessingService.getInstance();
