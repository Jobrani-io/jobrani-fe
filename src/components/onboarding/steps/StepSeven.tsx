import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { type FormData } from "../OnboardingFunnel";
import { Button } from "@/components/ui/button";
import { ResumeUpload } from "@/components/ResumeUpload";
import { ResumeParsingLoader } from "@/components/ResumeParsingLoader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useResumeProcessing } from "@/hooks/useResumeProcessing";

interface StepSevenProps {
  form: UseFormReturn<FormData>;
  onNext: () => void;
  onPrev: () => void;
}

export const StepSeven = ({ form, onNext, onPrev }: StepSevenProps) => {
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [canProceed, setCanProceed] = useState(false);
  const { startProcessing, activeProcessing, canNavigateEarly } = useResumeProcessing();

  const handleResumeUpload = async ({ file }: { file: File }) => {
    setCurrentFile(file);
    
    try {
      // Start background processing
      const processingId = await startProcessing(file);
      
      // Update form with file immediately
      form.setValue("resumeFile", file);
      
      // Allow user to proceed immediately after successful upload start
      setCanProceed(true);
      toast({
        title: "Resume uploaded!",
        description: "Processing in background. You can continue setup.",
      });
    } catch (error) {
      console.error("Error starting resume upload:", error);
      toast({
        title: "Upload failed",
        description: "Failed to start processing. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveResume = () => {
    form.setValue("resumeFile", null);
    form.setValue("resumeHighlights", []);
    form.setValue("resumeId", null);
  };

  const handleCancelParsing = () => {
    setCurrentFile(null);
    setCanProceed(false);
    toast({
      title: "Resume parsing cancelled",
      description: "You can try uploading again when ready.",
    });
  };

  const handleRetryParsing = () => {
    if (currentFile) {
      handleResumeUpload({ file: currentFile });
    }
  };

  const handleNext = () => {
    onNext();
  };

  const handleSkip = () => {
    // Clear any resume data if skipping
    form.setValue("resumeFile", null);
    form.setValue("resumeHighlights", []);
    form.setValue("resumeId", null);
    onNext();
  };

  const resumeFile = form.watch("resumeFile") as File | null;
  const resumeHighlights = form.watch("resumeHighlights") || [];
  
  // Update form when background processing completes
  useEffect(() => {
    if (activeProcessing?.status === 'completed' && activeProcessing.highlights && activeProcessing.resumeId) {
      form.setValue("resumeHighlights", activeProcessing.highlights);
      form.setValue("resumeId", activeProcessing.resumeId);
    }
  }, [activeProcessing, form]);
  
  const isProcessing = activeProcessing?.status === 'processing' || activeProcessing?.status === 'pending';
  const hasCompleted = activeProcessing?.status === 'completed' || resumeHighlights.length > 0;
  const hasError = activeProcessing?.status === 'error';

  return (
    <div className="space-y-3">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Upload Your Resume</h2>
          <p className="text-sm text-muted-foreground mt-1">
            This enables us to personalize job matches, messages, and auto-fill applications
          </p>
        </div>
      </div>

      <div className="bg-background/50 rounded-lg p-4 border border-border/50">
        {isProcessing ? (
          <ResumeParsingLoader
            onCancel={handleCancelParsing}
            onRetry={handleRetryParsing}
            fileName={currentFile?.name || activeProcessing?.fileName}
          />
        ) : (
          <ResumeUpload
            onResumeUpload={handleResumeUpload}
            uploadedFileName={resumeFile?.name}
            onRemove={handleRemoveResume}
            isProcessing={isProcessing}
            processingProgress={activeProcessing?.progress}
          />
        )}
      </div>

      {(canProceed && !hasCompleted) && (
        <Alert className="p-3">
          <Zap className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Resume uploaded successfully! Processing in background.
          </AlertDescription>
        </Alert>
      )}
      
      {hasCompleted && (
        <Alert className="p-3">
          <Sparkles className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Extracted {resumeHighlights.length} key highlights - Ready to personalize!
          </AlertDescription>
        </Alert>
      )}
      
      {hasError && (
        <Alert variant="destructive" className="p-3">
          <AlertDescription className="text-sm">
            Processing failed: {activeProcessing?.error || "Please try again"}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between pt-2">
        <Button
          variant="outline"
          onClick={onPrev}
          size="default"
          className="px-6"
        >
          ← Back
        </Button>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={handleSkip}
            size="default"
            className="px-6"
          >
            Skip for now
          </Button>
          <Button
            onClick={handleNext}
            variant="hero"
            size="default"
            className="px-8"
            disabled={!canProceed && isProcessing}
          >
            {isProcessing && !canProceed ? "Processing..." : "Complete Setup →"}
          </Button>
        </div>
      </div>
    </div>
  );
};
