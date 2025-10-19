import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  User,
  Wand2,
  Check,
  X,
  FileText,
  Sparkles,
} from "lucide-react";
import { ResumeUpload } from "../ResumeUpload";
import { ResumeParsingLoader } from "../ResumeParsingLoader";
import EnhancedPersonalHighlights from "./EnhancedPersonalHighlights";
import { ProfileData, PersonalHighlight } from "@/types/profileData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useResumeProcessing } from "@/hooks/useResumeProcessing";

interface ProfileSetupProps {
  profileData: ProfileData;
  onProfileUpdate: (data: Partial<ProfileData>) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({
  profileData,
  onProfileUpdate,
}) => {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [newHighlightText, setNewHighlightText] = useState("");
  const [newHighlightCategory, setNewHighlightCategory] =
    useState("experience");
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const { startProcessing, activeProcessing } = useResumeProcessing();

  // Handle background processing completion
  useEffect(() => {
    if (
      activeProcessing?.status === "completed" &&
      activeProcessing.highlights &&
      activeProcessing.resumeId
    ) {
      // Convert highlights string to PersonalHighlight objects
      const highlightTexts = activeProcessing.highlights;

      // Keep locked highlights and remove unlocked resume highlights
      const lockedHighlights = profileData.personalHighlights.filter(
        (h) => h.isLocked || !h.isFromResume
      );

      const newHighlights: PersonalHighlight[] = highlightTexts.map(
        (text: string, index: number) => ({
          id: `resume_highlight_${Date.now()}_${index}`,
          text: text.trim(),
          category: "experience" as const,
          isFromResume: true,
          order: lockedHighlights.length + index,
        })
      );

      onProfileUpdate({
        resumeId: activeProcessing.resumeId?.toString(),
        personalHighlights: [...lockedHighlights, ...newHighlights],
      });
    }
  }, [activeProcessing, profileData.personalHighlights, onProfileUpdate]);

  const handleResumeUpload = async ({ file }: { file: File }) => {
    setCurrentFile(file);

    try {
      // Start background processing
      await startProcessing(file);

      // Immediately update with file name for UI feedback
      onProfileUpdate({
        resumeFileName: file.name,
      });

      toast({
        title: "Resume uploaded!",
        description: "Processing in background. You can continue working.",
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

  const handleResumeRemove = () => {
    // Remove unlocked resume-generated highlights when removing resume
    const nonResumeHighlights = profileData.personalHighlights.filter(
      (h) => !h.isFromResume || h.isLocked
    );
    onProfileUpdate({
      resumeId: undefined,
      resumeFileName: undefined,
      personalHighlights: nonResumeHighlights,
    });
  };

  const handleCancelParsing = () => {
    setCurrentFile(null);
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

  const handleAddHighlight = () => {
    if (newHighlightText.trim()) {
      const newHighlight: PersonalHighlight = {
        id: `highlight_${Date.now()}`,
        text: newHighlightText.trim(),
        category: newHighlightCategory as any,
        isFromResume: false,
        order: profileData.personalHighlights.length,
      };

      onProfileUpdate({
        personalHighlights: [...profileData.personalHighlights, newHighlight],
      });

      setNewHighlightText("");
      setNewHighlightCategory("experience");
      setIsAdding(false);
    }
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewHighlightText("");
    setNewHighlightCategory("experience");
  };

  return (
    <Card id="personal-story-section" className="h-fit">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-1">
          <User className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Your Personal Story</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Set up the story you want employers to see
        </p>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Resume Upload Section */}
        <div className="space-y-2">
          <h3 className="font-medium">Resume</h3>

          {activeProcessing?.status === "processing" ||
          activeProcessing?.status === "pending" ? (
            <ResumeParsingLoader
              onCancel={handleCancelParsing}
              onRetry={handleRetryParsing}
              fileName={currentFile?.name || activeProcessing?.fileName}
            />
          ) : (
            <ResumeUpload
              onResumeUpload={handleResumeUpload}
              uploadedFileName={profileData.resumeFileName}
              onRemove={handleResumeRemove}
              isProcessing={["processing", "pending"].includes(
                activeProcessing?.status || ""
              )}
              processingProgress={activeProcessing?.progress}
            />
          )}
        </div>

        {/* Resume Highlights Header */}
        <div className="flex items-center gap-2 mb-3 mt-4">
          <h3 className="font-medium">Highlights</h3>
        </div>

        {/* Resume Highlights Section */}
        <div className="bg-muted/30 rounded-lg p-3">
          <EnhancedPersonalHighlights
            profileData={profileData}
            onProfileUpdate={onProfileUpdate}
          />

          {/* Add Resume Highlight Button or Form */}
          {isAdding ? (
            <div className="p-3 border border-dashed border-primary/50 rounded-lg bg-background mt-3">
              <div className="space-y-2">
                <Input
                  value={newHighlightText}
                  onChange={(e) => setNewHighlightText(e.target.value)}
                  placeholder="Enter a highlight from your resume..."
                  className="text-sm"
                />
                <Select
                  value={newHighlightCategory}
                  onValueChange={setNewHighlightCategory}
                >
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="achievement">Achievement</SelectItem>
                    <SelectItem value="skill">Skill</SelectItem>
                    <SelectItem value="experience">Experience</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleAddHighlight}
                    className="text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Add Resume Highlight
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelAdd}
                    className="text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(true)}
              className="w-full border-dashed text-xs mt-3"
            >
              <Wand2 className="h-3 w-3 mr-1" />
              Add Resume Highlight
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSetup;
