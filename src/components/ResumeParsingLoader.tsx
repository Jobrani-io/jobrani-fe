import React, { useState, useEffect } from "react";
import { Loader2, Clock, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ResumeParsingLoaderProps {
  onCancel: () => void;
  onRetry: () => void;
  fileName?: string;
}

export const ResumeParsingLoader = ({
  onCancel,
  onRetry,
  fileName,
}: ResumeParsingLoaderProps) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showExtendedMessage, setShowExtendedMessage] = useState(false);
  const [showRetryOption, setShowRetryOption] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed((prev) => {
        const newTime = prev + 1;
        
        // Show extended message after 5 seconds
        if (newTime === 5) {
          setShowExtendedMessage(true);
        }
        
        // Show retry option after 90 seconds
        if (newTime === 90) {
          setShowRetryOption(true);
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  {showExtendedMessage 
                    ? "Still working on it..." 
                    : "Processing your resume"
                  }
                </p>
                {fileName && (
                  <p className="text-xs text-muted-foreground">{fileName}</p>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatTime(timeElapsed)}
              </div>
            </div>
            
            {showExtendedMessage && (
              <p className="text-xs text-muted-foreground mt-1">
                This can take up to 60 seconds. Feel free to move on to other steps while we finish in the background.
              </p>
            )}
          </div>
          
          <div className="flex gap-1">
            {showRetryOption && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="h-7 w-7 p-0"
                title="Retry parsing"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-7 w-7 p-0"
              title="Cancel parsing"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};