import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Users, 
  ChevronDown, 
  ChevronUp, 
  User, 
  Building,
  Briefcase,
  CheckSquare,
  XSquare
} from 'lucide-react';
import { SAMPLE_PROSPECTS, type ProspectJob, type ProspectApproval } from '@/data/sampleProspects';

interface ProspectApprovalDropdownProps {
  prospectApprovals: Record<string, ProspectApproval>;
  onProspectApproval: (prospectId: string, status: 'approved' | 'rejected') => void;
  onBulkApproval: (status: 'approved' | 'rejected') => void;
}

export const ProspectApprovalDropdown: React.FC<ProspectApprovalDropdownProps> = ({
  prospectApprovals,
  onProspectApproval,
  onBulkApproval
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getApprovalStats = () => {
    const total = SAMPLE_PROSPECTS.length;
    const approved = SAMPLE_PROSPECTS.filter(p => prospectApprovals[p.id]?.status === 'approved').length;
    const rejected = SAMPLE_PROSPECTS.filter(p => prospectApprovals[p.id]?.status === 'rejected').length;
    const pending = total - approved - rejected;
    return { total, approved, rejected, pending };
  };

  const stats = getApprovalStats();

  const getRoleIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case 'hiring manager':
        return <Briefcase className="h-4 w-4" />;
      case 'recruiter':
        return <User className="h-4 w-4" />;
      case 'peer':
        return <Users className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  return (
    <div className="border rounded-lg">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5" />
              <div className="text-left">
                <h3 className="font-semibold">Prospect Approval</h3>
                <p className="text-sm text-muted-foreground">
                  {stats.approved}/{stats.total} prospects approved
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{stats.approved}/{stats.total}</Badge>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            {/* Bulk Actions */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-600">{stats.approved} Approved</span>
                <span className="text-yellow-600">{stats.pending} Pending</span>
                <span className="text-red-600">{stats.rejected} Rejected</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onBulkApproval('approved')}
                  disabled={stats.pending === 0}
                >
                  <CheckSquare className="h-3 w-3 mr-1" />
                  Approve All
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onBulkApproval('rejected')}
                  disabled={stats.pending === 0}
                >
                  <XSquare className="h-3 w-3 mr-1" />
                  Reject All
                </Button>
              </div>
            </div>

            {/* Individual Prospect Approvals */}
            <div className="space-y-2">
              {SAMPLE_PROSPECTS.map((prospect) => {
                const approval = prospectApprovals[prospect.id];
                const status = approval?.status || 'pending';

                return (
                  <div key={prospect.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        {getRoleIcon(prospect.title)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{prospect.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {prospect.title}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {prospect.company} • {prospect.location}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Select
                        value={status}
                        onValueChange={(value: 'approved' | 'rejected' | 'pending') => {
                          if (value !== 'pending') {
                            onProspectApproval(prospect.id, value);
                          }
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};