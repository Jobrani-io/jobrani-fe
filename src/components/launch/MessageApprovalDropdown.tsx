import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  CheckSquare,
  XSquare,
  Eye
} from 'lucide-react';
import { SAMPLE_PROSPECTS, getProspectMessages } from '@/data/sampleProspects';

interface MessageApproval {
  messageId: string;
  prospectId: string;
  status: 'approved' | 'rejected' | 'pending';
}

interface MessageApprovalDropdownProps {
  messageApprovals: Record<string, MessageApproval>;
  onMessageApproval: (messageId: string, prospectId: string, status: 'approved' | 'rejected') => void;
  onBulkMessageApproval: (status: 'approved' | 'rejected') => void;
}

export const MessageApprovalDropdown: React.FC<MessageApprovalDropdownProps> = ({
  messageApprovals,
  onMessageApproval,
  onBulkMessageApproval
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  // Get all messages for all prospects
  const allMessages = SAMPLE_PROSPECTS.flatMap(prospect => 
    getProspectMessages(prospect.id).map(message => ({
      ...message,
      prospectId: prospect.id,
      prospectName: prospect.name,
      messageId: `${prospect.id}-${message.step}`
    }))
  );

  const getMessageApprovalStats = () => {
    const total = allMessages.length;
    const approved = allMessages.filter(m => 
      messageApprovals[m.messageId]?.status === 'approved'
    ).length;
    const rejected = allMessages.filter(m => 
      messageApprovals[m.messageId]?.status === 'rejected'
    ).length;
    const pending = total - approved - rejected;
    return { total, approved, rejected, pending };
  };

  const stats = getMessageApprovalStats();

  return (
    <div className="border rounded-lg">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5" />
              <div className="text-left">
                <h3 className="font-semibold">Message Approval</h3>
                <p className="text-sm text-muted-foreground">
                  {stats.approved}/{stats.total} messages approved
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
                  onClick={() => onBulkMessageApproval('approved')}
                  disabled={stats.pending === 0}
                >
                  <CheckSquare className="h-3 w-3 mr-1" />
                  Approve All
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onBulkMessageApproval('rejected')}
                  disabled={stats.pending === 0}
                >
                  <XSquare className="h-3 w-3 mr-1" />
                  Reject All
                </Button>
              </div>
            </div>

            {/* Individual Message Approvals */}
            <div className="space-y-3">
              {allMessages.map((message) => {
                const approval = messageApprovals[message.messageId];
                const status = approval?.status || 'pending';
                const isExpanded = selectedMessage === message.messageId;

                return (
                  <div key={message.messageId} className="border rounded-lg">
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Step {message.step}</Badge>
                          <Badge variant="secondary">{message.type}</Badge>
                        </div>
                        <div>
                          <span className="font-medium">{message.prospectName}</span>
                          <p className="text-sm text-muted-foreground">
                            {message.content.substring(0, 50)}...
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedMessage(
                            isExpanded ? null : message.messageId
                          )}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Select
                          value={status}
                          onValueChange={(value: 'approved' | 'rejected' | 'pending') => {
                            if (value !== 'pending') {
                              onMessageApproval(message.messageId, message.prospectId, value);
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
                    
                    {isExpanded && (
                      <div className="px-3 pb-3 border-t bg-muted/30">
                        <div className="pt-3">
                          <h4 className="font-medium mb-2">Message Preview</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {message.content}
                          </p>
                          {message.delay && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Delay: {message.delay}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
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