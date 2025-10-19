import React from 'react';
import { CheckCircle, XCircle, Edit, User, Briefcase, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { ProspectApproval, ProspectJob } from '@/data/sampleProspects';

interface ContactsTabProps {
  prospects: ProspectJob[];
  prospectApprovals: Record<string, ProspectApproval>;
  onProspectApproval: (prospectId: string, status: 'approved' | 'rejected', notes?: string) => void;
  onBulkApproval: (prospectIds: string[], status: 'approved' | 'rejected') => void;
}

export function ContactsTab({
  prospects,
  prospectApprovals,
  onProspectApproval,
  onBulkApproval,
}: ContactsTabProps) {
  const getRoleType = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('manager') || lowerTitle.includes('director') || lowerTitle.includes('vp')) {
      return 'Hiring Manager';
    }
    if (lowerTitle.includes('recruiter') || lowerTitle.includes('talent')) {
      return 'Recruiter';
    }
    return 'Peer';
  };

  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case 'Hiring Manager':
        return <Briefcase className="h-4 w-4" />;
      case 'Recruiter':
        return <Users className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getApprovalStatus = (prospectId: string) => {
    const approval = prospectApprovals[prospectId];
    return approval?.status || 'pending';
  };

  const handleBulkApproveAll = () => {
    const prospectIds = prospects.map(p => p.id);
    onBulkApproval(prospectIds, 'approved');
  };

  const handleBulkDeclineAll = () => {
    const prospectIds = prospects.map(p => p.id);
    onBulkApproval(prospectIds, 'rejected');
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      <div className="flex gap-2 mb-4">
        <Button onClick={handleBulkApproveAll} size="sm">
          <CheckCircle className="h-4 w-4 mr-2" />
          Approve All Contacts
        </Button>
        <Button variant="destructive" onClick={handleBulkDeclineAll} size="sm">
          <XCircle className="h-4 w-4 mr-2" />
          Decline All
        </Button>
      </div>

      {/* Contact List */}
      <div className="space-y-3">
        {prospects.map((prospect) => {
          const roleType = getRoleType(prospect.title);
          const status = getApprovalStatus(prospect.id);
          
          return (
            <Card key={prospect.id} className="relative">
              <CardContent className="p-4">
                {/* Floating status badge in top-right */}
                {status === 'approved' && (
                  <Badge className="absolute top-3 right-3 bg-green-100 text-green-800 text-xs">
                    Approved
                  </Badge>
                )}
                {status === 'rejected' && (
                  <Badge className="absolute top-3 right-3 bg-red-100 text-red-800 text-xs">
                    Declined
                  </Badge>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-16">
                    {/* Name and role section */}
                    <div className="flex items-center gap-3 mb-2">
                      {getRoleIcon(roleType)}
                      <div>
                        <h4 className="font-medium text-lg">{prospect.name}</h4>
                        <p className="text-sm text-muted-foreground">{prospect.title}</p>
                      </div>
                    </div>
                    
                    <Badge variant="outline" className="text-xs">
                      {roleType}
                    </Badge>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex gap-2 shrink-0">
                    {status !== 'approved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onProspectApproval(prospect.id, 'approved')}
                        className="h-8 w-8 p-0"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {status !== 'rejected' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onProspectApproval(prospect.id, 'rejected')}
                        className="h-8 w-8 p-0"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}