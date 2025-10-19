import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquare, ExternalLink } from "lucide-react";

// Trimmed prospect data structure from backend
interface TrimmedProspect {
  prospect_id: string;
  company: string;
  job_title: string;
}

// Trimmed preferred match data structure from backend
interface TrimmedPreferredMatch {
  first_name: string;
  last_name: string;
  title: string;
}

// Generated message structure
interface GeneratedMessage {
  prospect: TrimmedProspect;
  match: TrimmedPreferredMatch;
  message: string;
  subject: string;
  messageId: string;
  approved?: boolean;
  messageType?: "LinkedIn Connect" | "Follow-up" | "InMail";
}

interface ApprovedMessagesTableProps {
  approvedMessages: GeneratedMessage[];
  onUnapproveMessage: (messageId: string) => void;
  onBulkUnapprove: (messageIds: string[]) => void;
  selectedMessages: string[];
  onSelectedMessagesChange: (messageIds: string[]) => void;
  onClearSelection: () => void;
}

export const ApprovedMessagesTable = ({ 
  approvedMessages, 
  onUnapproveMessage,
  onBulkUnapprove,
  selectedMessages,
  onSelectedMessagesChange,
  onClearSelection
}: ApprovedMessagesTableProps) => {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectedMessagesChange(approvedMessages.map((m) => m.messageId));
    } else {
      onSelectedMessagesChange([]);
    }
  };

  const handleSelectMessage = (messageId: string, checked: boolean) => {
    if (checked) {
      onSelectedMessagesChange([...selectedMessages, messageId]);
    } else {
      onSelectedMessagesChange(
        selectedMessages.filter((id) => id !== messageId)
      );
    }
  };

  const allSelected = 
    selectedMessages.length === approvedMessages.length && approvedMessages.length > 0;

  if (approvedMessages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Approved Messages
          </CardTitle>
          <CardDescription>
            Messages you've approved will appear here
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No approved messages yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Approved Messages
            <Badge variant="secondary">{approvedMessages.length} total</Badge>
          </CardTitle>
          {selectedMessages.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="default" className="font-medium">
                {selectedMessages.length} selected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="h-7 px-2 text-xs"
              >
                Clear selection
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all approved messages"
                />
              </TableHead>
              <TableHead className="w-48">Job & Company</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {approvedMessages.map((message) => (
              <TableRow key={message.messageId} className="align-top">
                <TableCell>
                  <Checkbox
                    checked={selectedMessages.includes(message.messageId)}
                    onCheckedChange={(checked) =>
                      handleSelectMessage(
                        message.messageId,
                        checked as boolean
                      )
                    }
                    aria-label={`Select message for ${message.match.first_name} ${message.match.last_name}`}
                  />
                </TableCell>

                <TableCell className="w-48">
                  <div className="space-y-1">
                    <div className="font-semibold text-primary">
                      {message.prospect.job_title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {message.prospect.company}
                    </div>
                    <div className="mt-2 pt-2 border-t border-border">
                      <div className="text-xs text-muted-foreground font-medium">Contact:</div>
                      <div className="text-sm font-medium text-foreground">
                        {message.match.first_name} {message.match.last_name}
                      </div>
                      {message.match.title && (
                        <div className="text-xs text-muted-foreground">
                          {message.match.title}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-2">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed rounded-md p-2 bg-muted/30">
                      {message.subject && (
                        <div className="font-medium text-foreground mb-2 border-b border-border pb-1">
                          Subject: {message.subject}
                        </div>
                      )}
                      {message.message}
                    </div>
                    
                    {/* Character count */}
                    <div className="text-xs text-muted-foreground mt-1">
                      {message.message.length} characters
                    </div>
                    
                    <Badge variant="default" className="text-xs">
                      Approved
                    </Badge>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};