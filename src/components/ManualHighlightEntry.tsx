import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, FileText } from "lucide-react";

interface ManualHighlightEntryProps {
  onHighlightsChange: (highlights: string) => void;
  existingHighlights?: string;
}

export const ManualHighlightEntry = ({
  onHighlightsChange,
  existingHighlights = "",
}: ManualHighlightEntryProps) => {
  const [newHighlight, setNewHighlight] = useState("");
  
  const handleAddHighlight = () => {
    if (!newHighlight.trim()) return;
    
    const trimmedHighlight = newHighlight.trim();
    const updatedHighlights = existingHighlights 
      ? `${existingHighlights}\n${trimmedHighlight}`
      : trimmedHighlight;
    
    onHighlightsChange(updatedHighlights);
    setNewHighlight("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAddHighlight();
    }
  };

  const sampleHighlights = [
    "3+ years in student leadership, consulting, and finance roles",
    "1st place, Accenture Consulting Case Competition 2022",
    "Founded education startup, grew to $40k revenue in 4 months",
    "VP of Finance Club, managed 35-person promotions team",
    "Implemented CRM system improving client management efficiency",
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-subtle border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Add Job Highlights Manually</CardTitle>
              <p className="text-sm text-muted-foreground">
                Add your key accomplishments and experiences one by one
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-highlight">New Highlight</Label>
            <Textarea
              id="new-highlight"
              value={newHighlight}
              onChange={(e) => setNewHighlight(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Example: Led team of 5 engineers to deliver mobile app with 10k+ downloads in first month"
              className="min-h-[80px] resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Press Ctrl+Enter to quickly add • Be specific and quantify results when possible
              </p>
              <span className="text-xs text-muted-foreground">
                {newHighlight.length}/500
              </span>
            </div>
          </div>

          <Button
            onClick={handleAddHighlight}
            disabled={!newHighlight.trim()}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Highlight
          </Button>
        </CardContent>
      </Card>

      {/* Sample Highlights for Inspiration */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            💡 Highlight Examples
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sampleHighlights.map((sample, index) => (
              <div
                key={index}
                className="text-xs p-2 bg-background rounded border text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setNewHighlight(sample)}
                title="Click to use this example"
              >
                {sample}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Click any example above to use as a starting point
          </p>
        </CardContent>
      </Card>
    </div>
  );
};