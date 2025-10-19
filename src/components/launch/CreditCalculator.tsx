import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Sparkles, Info, Calendar } from 'lucide-react';

interface CreditCalculatorProps {
  totalCreditsNeeded: number;
  dailyCreditsAvailable: number;
  currentCreditsUsed: number;
  dailyLimit: number;
  estimatedDays: number;
  canLaunch: boolean;
}

export const CreditCalculator = ({
  totalCreditsNeeded,
  dailyCreditsAvailable,
  currentCreditsUsed,
  dailyLimit,
  estimatedDays,
  canLaunch
}: CreditCalculatorProps) => {
  const creditsRemaining = dailyLimit - currentCreditsUsed;
  const needsMoreCredits = totalCreditsNeeded > creditsRemaining;
  const shortfall = needsMoreCredits ? totalCreditsNeeded - creditsRemaining : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Campaign Credit Usage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Credit Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalCreditsNeeded}</div>
            <div className="text-sm text-muted-foreground">Credits Needed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{estimatedDays}</div>
            <div className="text-sm text-muted-foreground">Days to Complete</div>
          </div>
        </div>

        {/* Daily Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Daily Credits Available</span>
            <span className="font-medium">{creditsRemaining}/{dailyLimit}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Credits per Day Needed</span>
            <span className="font-medium">{Math.ceil(totalCreditsNeeded / estimatedDays)}</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant={canLaunch ? "default" : "destructive"}
                  className={`gap-2 ${
                    canLaunch 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : needsMoreCredits 
                        ? 'bg-destructive/10 text-destructive border-destructive/20'
                        : 'bg-orange-100 text-orange-800 border-orange-200'
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  {canLaunch 
                    ? `Ready to Launch (${totalCreditsNeeded} credits)` 
                    : needsMoreCredits
                      ? `Need ${shortfall} more credits`
                      : 'Campaign Too Large'
                  }
                  <Info className="h-3 w-3" />
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center space-y-1">
                  <div className="font-medium">Campaign Credit Breakdown</div>
                  <div className="text-xs text-muted-foreground">
                    {currentCreditsUsed} used today, {creditsRemaining} remaining
                  </div>
                  <div className="text-xs text-muted-foreground">
                    This campaign needs {totalCreditsNeeded} total credits
                  </div>
                  {needsMoreCredits && (
                    <div className="text-xs text-destructive">
                      You need {shortfall} more credits to start today
                    </div>
                  )}
                  {canLaunch && (
                    <div className="text-xs text-green-700">
                      Campaign will complete in {estimatedDays} days
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Timeline Display */}
        {canLaunch && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Campaign will run for {estimatedDays} days at {Math.ceil(totalCreditsNeeded / estimatedDays)} credits/day</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};