import React from 'react';
import { CheckCircle, Clock, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ApprovalProgressProps {
  approvedCount: number;
  totalCount: number;
  highConfidenceCount: number;
  onApproveAllHigh: () => void;
  onLaunchCampaign: () => void;
  showLaunchButton: boolean;
}

const ApprovalProgress = ({
  approvedCount,
  totalCount,
  highConfidenceCount,
  onApproveAllHigh,
  onLaunchCampaign,
  showLaunchButton
}: ApprovalProgressProps) => {
  const progressPercentage = totalCount > 0 ? (approvedCount / totalCount) * 100 : 0;
  const pendingCount = totalCount - approvedCount;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Approval Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Jobs Approved</span>
            <span className="font-medium">{approvedCount} of {totalCount}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Approved
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              Pending
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{highConfidenceCount}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Zap className="h-3 w-3" />
              High Confidence
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {highConfidenceCount > 0 && (
            <Button
              onClick={onApproveAllHigh}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Zap className="h-4 w-4 mr-2" />
              Approve All High Confidence ({highConfidenceCount})
            </Button>
          )}
          
          {showLaunchButton && (
            <Button
              onClick={onLaunchCampaign}
              variant="hero"
              size="lg"
              className="w-full"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Launch Campaign ({approvedCount} jobs)
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApprovalProgress;