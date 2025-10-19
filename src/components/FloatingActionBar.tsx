import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import {
  Bot,
  Check,
  Sparkles,
  RefreshCw,
  MessageCircle,
  Edit3,
  Undo2,
  X,
} from "lucide-react";
import { useState } from "react";

interface FloatingActionBarProps {
  selectedMessages: string[];
  selectedHighlights?: string[];
  onClearSelection: () => void;
  onBulkApprove?: (messageIds: string[]) => void;
  onBulkUnapprove?: (messageIds: string[]) => void;
  onBulkRegenerate?: (messageIds: string[]) => void;
  onRegenerateWithAI?: (instructions: string, messageIds: string[]) => void;
  onRegenerateMessagesFromHighlights?: (
    instructions: string,
    highlightIds: string[]
  ) => void;
  onEditManually?: (messageIds: string[]) => void;
  onUndo?: () => void;
  isRegenerating?: boolean;
  isGeneratingMessages?: boolean;
  messageCount: number;
  messageType: "approved" | "unapproved";
  resumeFileName?: string;
  onChangeResume?: () => void;
  dailyStats?: { used: number; limit: number; remaining: number } | null;
  disableTextArea?: boolean;
}

export const FloatingActionBar = ({
  selectedMessages,
  selectedHighlights = [],
  onBulkApprove,
  onBulkUnapprove,
  onRegenerateWithAI,
  onRegenerateMessagesFromHighlights,
  onEditManually,
  onUndo,
  isRegenerating = false,
  isGeneratingMessages = false,
  messageCount,
  messageType,
  dailyStats,
  disableTextArea = false,
}: FloatingActionBarProps) => {
  const [instructions, setInstructions] = useState("");
  const [showFeedbackTextarea, setShowFeedbackTextarea] = useState(false);
  const hasSelection = selectedMessages.length > 0;
  const hasHighlightSelection = selectedHighlights.length > 0;

  // Calculate credits that will be used and remaining
  const creditsToUse = hasSelection ? selectedMessages.length : messageCount;
  const creditsAfterAction = dailyStats
    ? dailyStats.limit - dailyStats.used - creditsToUse
    : 0;
  const needsMoreCredits = dailyStats ? creditsAfterAction < 0 : false;

  const handleAutoRegenerate = () => {
    if (isRegenerating || isGeneratingMessages) return;

    if (hasHighlightSelection && onRegenerateMessagesFromHighlights) {
      onRegenerateMessagesFromHighlights("", selectedHighlights);
      return;
    }

    if (selectedMessages.length === 0) {
      toast({
        title: "No messages selected",
        description: "Please select messages to regenerate.",
        variant: "destructive",
      });
      return;
    }

    onRegenerateWithAI?.("", selectedMessages);
  };

  const handleProvideFeedback = () => {
    // If textarea is not shown, show it and focus
    if (!showFeedbackTextarea) {
      setShowFeedbackTextarea(true);
      // Focus will be handled by the textarea when it appears
      return;
    }

    // If textarea is shown but no instructions, do nothing
    if (!instructions.trim() || isRegenerating || isGeneratingMessages) return;

    if (hasHighlightSelection && onRegenerateMessagesFromHighlights) {
      onRegenerateMessagesFromHighlights(
        instructions.trim(),
        selectedHighlights
      );
      setInstructions("");
      setShowFeedbackTextarea(false);
      return;
    }

    if (selectedMessages.length === 0) {
      toast({
        title: "No messages selected",
        description: "Please select messages to regenerate.",
        variant: "destructive",
      });
      return;
    }

    onRegenerateWithAI?.(instructions.trim(), selectedMessages);
    setInstructions("");
    setShowFeedbackTextarea(false);
  };

  const handleCancelFeedback = () => {
    setShowFeedbackTextarea(false);
    setInstructions("");
  };

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        <Card className="border-primary/20 bg-background/95 backdrop-blur-sm shadow-lg">
          <div className="p-6 space-y-4">
            {/* AI Assistant Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 border border-primary/20">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <Label className="text-sm font-semibold">
                  AI Message Assistant
                </Label>
              </div>

              {/* Textarea - Only show when feedback mode is active */}
              {showFeedbackTextarea && (
                <div className="relative">
                  <Textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder={
                      isGeneratingMessages
                        ? "Please wait while messages are being generated..."
                        : hasHighlightSelection
                        ? "Regenerate messages using selected highlights: make them more technical, focus on leadership..."
                        : messageType === "approved"
                        ? "AI assistant not available for approved messages"
                        : "Make them more casual, add technical details, focus on leadership experience..."
                    }
                    rows={2}
                    className="resize-none pr-12 border-2 border-dashed border-muted-foreground/20 focus:border-primary/50 transition-colors"
                    disabled={
                      isGeneratingMessages ||
                      isRegenerating ||
                      (messageType === "approved" && !hasHighlightSelection)
                    }
                    autoFocus
                  />
                  <div className="absolute bottom-2 right-2">
                    {dailyStats ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="secondary"
                            className={`text-xs px-2 py-1 gap-1 ${
                              needsMoreCredits
                                ? "bg-destructive/10 text-destructive border-destructive/20"
                                : creditsAfterAction <= 2
                                ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                                : creditsAfterAction <= 5
                                ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                                : "bg-muted text-muted-foreground border-0"
                            }`}
                          >
                            <Sparkles className="h-3 w-3" />
                            {needsMoreCredits
                              ? `Need ${Math.abs(
                                  creditsAfterAction
                                )} more credits`
                              : creditsToUse > 0
                              ? `${creditsAfterAction} left`
                              : `${dailyStats.remaining} credits left`}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-center space-y-1">
                            <div className="font-medium">Daily AI Credits</div>
                            <div className="text-xs text-muted-foreground">
                              Used {dailyStats.used} of {dailyStats.limit} daily
                              credits
                            </div>
                            {creditsToUse > 0 && (
                              <>
                                <div className="text-xs text-muted-foreground">
                                  This action will use {creditsToUse} credits
                                </div>
                                <div className="text-xs">
                                  {needsMoreCredits
                                    ? `You need ${Math.abs(
                                        creditsAfterAction
                                      )} more credits`
                                    : `${creditsAfterAction} credits will remain`}
                                </div>
                              </>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Sparkles className="h-4 w-4 text-muted-foreground/50" />
                    )}
                  </div>

                  {/* Cancel button for textarea */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelFeedback}
                    className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Action Buttons - Toolbox Layout */}
            <div className="grid grid-cols-4 gap-3 pt-2">
              {/* Top Row */}
              {/* Auto-Regenerate */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAutoRegenerate}
                    disabled={
                      isRegenerating ||
                      isGeneratingMessages ||
                      (!hasSelection && !hasHighlightSelection) ||
                      (messageType === "approved" && !hasHighlightSelection)
                    }
                    className="gap-2 h-10 px-4"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Auto-Regenerate
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {messageType === "approved" && !hasHighlightSelection 
                    ? "Auto-regenerate not available for approved messages"
                    : "Auto-regenerate selected messages without custom instructions"
                  }
                </TooltipContent>
              </Tooltip>

              {/* Provide Feedback */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleProvideFeedback}
                    disabled={
                      isRegenerating ||
                      isGeneratingMessages ||
                      (showFeedbackTextarea && !instructions.trim()) ||
                      (!hasSelection && !hasHighlightSelection) ||
                      (messageType === "approved" && !hasHighlightSelection)
                    }
                    className="gap-2 h-10 px-4"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {showFeedbackTextarea
                      ? "Submit Feedback"
                      : "Provide Feedback"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {messageType === "approved" && !hasHighlightSelection
                    ? "Feedback not available for approved messages"
                    : showFeedbackTextarea
                    ? "Submit your custom instructions to regenerate messages"
                    : "Write custom instructions to regenerate messages"}
                </TooltipContent>
              </Tooltip>

              {/* Edit Manually */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditManually?.(selectedMessages)}
                    disabled={
                      isGeneratingMessages || 
                      !hasSelection ||
                      messageType === "approved"
                    }
                    className="gap-2 h-10 px-4"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Manually
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {messageType === "approved"
                    ? "Manual editing not available for approved messages"
                    : "Manually edit selected messages"}
                </TooltipContent>
              </Tooltip>

              {/* Bottom Row - Centered across 3 columns */}
              {/* Approve/Unapprove */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (messageType === "approved" && onBulkUnapprove) {
                        onBulkUnapprove(selectedMessages);
                      } else if (
                        messageType === "unapproved" &&
                        onBulkApprove
                      ) {
                        onBulkApprove(selectedMessages);
                      }
                    }}
                    disabled={isGeneratingMessages || !hasSelection}
                    className="gap-2 h-10 px-4"
                  >
                    <Check className="h-4 w-4" />
                    {messageType === "approved" ? "Unapprove" : "Approve"}
                    {hasSelection ? ` (${selectedMessages.length})` : ""}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {hasSelection
                    ? `${
                        messageType === "approved" ? "Unapprove" : "Approve"
                      } ${selectedMessages.length} selected messages`
                    : `Select messages to ${
                        messageType === "approved" ? "unapprove" : "approve"
                      }`}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </Card>
      </div>
    </TooltipProvider>
  );
};
