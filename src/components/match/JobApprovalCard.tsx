import React from 'react';
import { CheckCircle, Edit, X, Users, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ContactIntelligenceService } from '@/services/contactIntelligence';
import { JobOpportunity, JobContact } from '@/data/jobOpportunities';
import { EnhancedJobContact } from '@/services/contactIntelligence';

interface JobApprovalCardProps {
  job: JobOpportunity;
  selectedContact: JobContact | null;
  enhancedContact: EnhancedJobContact | null;
  onApprove: (jobId: string) => void;
  onReject: (jobId: string) => void;
  onChangeContact: (jobId: string) => void;
  isApproved: boolean;
}

const JobApprovalCard = ({
  job,
  selectedContact,
  enhancedContact,
  onApprove,
  onReject,
  onChangeContact,
  isApproved
}: JobApprovalCardProps) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  const roleInfo = enhancedContact ? ContactIntelligenceService.getHiringManagerInfo(enhancedContact.isHiringManager, enhancedContact.confidence) : null;

  return (
    <Card className={`transition-all ${isApproved ? 'border-green-200 bg-green-50/30' : 'border-border'}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{job.jobTitle}</h3>
              <p className="text-muted-foreground">{job.company} • {job.location}</p>
            </div>
            {isApproved && (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            )}
          </div>

          {/* Selected Contact */}
          {selectedContact && enhancedContact ? (
            <div className="bg-background/50 rounded-lg p-4 border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{selectedContact.name}</h4>
                    {roleInfo && (
                      <Badge variant="secondary" className="text-xs">
                        {roleInfo.icon} {roleInfo.label}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedContact.title}</p>
                </div>
                <div className="text-right space-y-1">
                  <Badge className={`text-xs ${getConfidenceColor(enhancedContact.confidence)}`}>
                    {getConfidenceLabel(enhancedContact.confidence)} Confidence
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {selectedContact.mutualConnections} mutual
                  </div>
                </div>
              </div>

              {/* Match Score */}
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <div className="text-sm">
                  <span className="font-medium">{selectedContact.matchScore}% match</span>
                  {roleInfo && (
                    <span className="text-muted-foreground ml-2">• {roleInfo.description}</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-muted/30 rounded-lg p-4 border border-dashed">
              <div className="text-center text-muted-foreground">
                <X className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No suitable contacts found</p>
                <p className="text-xs">You may need to research contacts manually</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {selectedContact ? (
              <>
                <Button
                  onClick={() => onApprove(job.id)}
                  variant={isApproved ? "secondary" : "default"}
                  size="sm"
                  className="flex-1"
                  disabled={isApproved}
                >
                  {isApproved ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approved
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      Approve Contact
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => onChangeContact(job.id)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Change
                </Button>
              </>
            ) : (
              <Button
                onClick={() => onReject(job.id)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Skip Job
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobApprovalCard;