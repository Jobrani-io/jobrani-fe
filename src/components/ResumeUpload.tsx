import React, { useCallback, useState } from "react";
import { Upload, File, X, FileText, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface ResumeUploadProps {
  onResumeUpload: ({ file }: { file: File }) => void;
  uploadedFileName?: string;
  onRemove: () => void;
  isProcessing?: boolean;
  processingProgress?: number;
}

export const ResumeUpload = ({
  onResumeUpload,
  uploadedFileName,
  onRemove,
  isProcessing = false,
  processingProgress,
}: ResumeUploadProps) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      if (isProcessing) {
        toast({
          title: "Processing in progress",
          description: "Please wait for the current resume to finish processing.",
          variant: "destructive",
        });
        return;
      }

      if (!file.type.includes("pdf") && !file.type.includes("doc")) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or DOC file.",
          variant: "destructive",
        });
        return;
      }

      setIsUploading(true);
      try {
        onResumeUpload({ file });

        toast({
          title: "Resume uploaded successfully",
          description:
            "Your resume has been processed and is ready for analysis.",
        });
      } catch (error) {
        toast({
          title: "Upload failed",
          description: "There was an error processing your resume.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [onResumeUpload, toast, isProcessing]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  if (uploadedFileName) {
    // Show interactive success card that allows replacement
    return (
      <div className="space-y-4">
        <Card 
          className={`border-success bg-success/5 transition-colors ${
            isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-success/10"
          } ${isDragActive && !isProcessing ? "border-primary bg-primary/10" : ""}`}
          onDragEnter={!isProcessing ? handleDragEnter : undefined}
          onDragLeave={!isProcessing ? handleDragLeave : undefined}
          onDragOver={!isProcessing ? handleDragOver : undefined}
          onDrop={!isProcessing ? handleDrop : undefined}
          onClick={!isProcessing ? () => document.getElementById('resume-replace')?.click() : undefined}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 text-success" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{uploadedFileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {isProcessing ? "Processing resume..." : 
                     isDragActive ? "Drop to replace resume" : "Drag new file here or click to replace"}
                  </p>
                  {isProcessing && processingProgress !== undefined && (
                    <div className="mt-2">
                      <Progress value={processingProgress} className="h-1.5" />
                      <div className="text-xs text-muted-foreground mt-1">
                        {processingProgress}% complete
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="resume-replace"
                  disabled={isUploading || isProcessing}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="h-7 w-7 p-0"
                  disabled={isUploading || isProcessing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show initial upload area when no resume is uploaded
  return (
    <div className="space-y-4">
      <Card
        className={`border-2 border-dashed transition-colors ${
          isProcessing
            ? "border-muted-foreground/25 opacity-50 cursor-not-allowed"
            : isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        }`}
        onDragEnter={!isProcessing ? handleDragEnter : undefined}
        onDragLeave={!isProcessing ? handleDragLeave : undefined}
        onDragOver={!isProcessing ? handleDragOver : undefined}
        onDrop={!isProcessing ? handleDrop : undefined}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            {isProcessing ? (
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            ) : (
              <Upload className="h-5 w-5 text-muted-foreground" />
            )}
            <div className="text-center">
              <p className="text-sm font-medium">
                {isProcessing ? "Processing resume..." : isUploading ? "Uploading..." : "Drop resume or"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isProcessing ? "Please wait..." : "PDF, DOC files"}
              </p>
              {isProcessing && processingProgress !== undefined && (
                <div className="mt-3 w-32">
                  <Progress value={processingProgress} className="h-1.5" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {processingProgress}% complete
                  </div>
                </div>
              )}
            </div>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
              id="resume-upload"
              disabled={isUploading || isProcessing}
            />
            <Button variant="outline" size="sm" asChild disabled={isUploading || isProcessing}>
              <label htmlFor="resume-upload" className={`${isUploading || isProcessing ? "cursor-not-allowed" : "cursor-pointer"}`}>
                <File className="h-4 w-4 mr-1" />
                Browse
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
