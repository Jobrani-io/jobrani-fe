import React from 'react';
import { CheckCircle, XCircle, Edit, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProspectMessages } from '@/data/sampleProspects';
import type { ProspectApproval, ProspectJob } from '@/data/sampleProspects';

interface MessagesTabProps {
  prospects: ProspectJob[];
  prospectApprovals: Record<string, ProspectApproval>;
  onProspectApproval: (prospectId: string, status: 'approved' | 'rejected', notes?: string) => void;
}

export function MessagesTab({
  prospects,
  prospectApprovals,
  onProspectApproval,
}: MessagesTabProps) {
  const getApprovalStatus = (prospectId: string) => {
    const approval = prospectApprovals[prospectId];
    return approval?.status || 'pending';
  };

  const getMessageTypeIcon = (type: string) => {
    return <MessageSquare className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Messages by Contact */}
      <div className="space-y-4">
        {prospects.map((prospect) => {
          const messages = getProspectMessages(prospect.id);
          const status = getApprovalStatus(prospect.id);
          
          return (
            <Card key={prospect.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>Messages for {prospect.name}</span>
                    {status === 'approved' && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded-md">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-700 font-medium">Approved</span>
                      </div>
                    )}
                    {status === 'rejected' && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-200 rounded-md">
                        <XCircle className="h-3 w-3 text-red-600" />
                        <span className="text-xs text-red-700 font-medium">Declined</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {status !== 'approved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onProspectApproval(prospect.id, 'approved')}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {status !== 'rejected' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onProspectApproval(prospect.id, 'rejected')}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {messages.map((message, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      {getMessageTypeIcon(message.type)}
                      <span className="text-sm font-medium capitalize">
                        Step {message.step}: {message.type}
                      </span>
                      {message.subject && (
                        <Badge variant="outline" className="text-xs">
                          {message.subject}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {message.delay}
                      </span>
                    </div>
                    
                    <div className="text-sm">
                      <strong>AI-Generated Message:</strong>
                      <p className="mt-1 p-2 bg-blue-50 rounded border-l-4 border-blue-200">
                        {message.personalizedContent}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}