import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Sparkles, Trash2, RefreshCw } from "lucide-react";

interface Highlight {
  id: string;
  text: string;
}

interface HighlightAIAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHighlights: Highlight[];
  onRegenerateHighlights: (highlightIds: string[], feedback: string) => void;
  onDeleteHighlights: (highlightIds: string[]) => void;
}

export const HighlightAIAssistModal = ({
  isOpen,
  onClose,
  selectedHighlights,
  onRegenerateHighlights,
  onDeleteHighlights,
}: HighlightAIAssistModalProps) => {
  const [feedback, setFeedback] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRegenerate = async () => {
    if (!feedback.trim()) return;
    
    setIsProcessing(true);
    try {
      await onRegenerateHighlights(
        selectedHighlights.map(h => h.id), 
        feedback.trim()
      );
      setFeedback("");
      onClose();
    } catch (error) {
      console.error("Error regenerating highlights:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = () => {
    onDeleteHighlights(selectedHighlights.map(h => h.id));
    onClose();
  };

  const handleClose = () => {
    setFeedback("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Assistant - Improve Highlights
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Highlights Preview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">
                Selected Highlights
              </Label>
              <Badge variant="secondary">
                {selectedHighlights.length} selected
              </Badge>
            </div>
            
            <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-muted/30 rounded-lg border">
              {selectedHighlights.map((highlight, index) => (
                <div 
                  key={highlight.id}
                  className="text-sm p-2 bg-background rounded border"
                >
                  <span className="text-muted-foreground mr-2">
                    {index + 1}.
                  </span>
                  {highlight.text}
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Input */}
          <div className="space-y-3">
            <Label htmlFor="feedback" className="text-sm font-medium">
              How would you like to improve these highlights?
            </Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Example: Make them more specific to sales roles, focus on quantifiable results, use more action verbs, etc."
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              Provide specific feedback on how you'd like the AI to improve or regenerate these highlights.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              onClick={handleRegenerate}
              disabled={!feedback.trim() || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Regenerate Highlights
                </>
              )}
            </Button>
            
            <Button
              onClick={handleDelete}
              variant="outline"
              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
            
            <Button
              onClick={handleClose}
              variant="ghost"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};