import React, { useState, useRef, useEffect } from "react";
import { ExternalLink, Mail, Linkedin, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface GeneratedMessage {
  prospect: TrimmedProspect;
  match: TrimmedPreferredMatch;
  message: string;
  subject: string;
  messageId: string;
  approved?: boolean;
  messageType?: "LinkedIn Connect" | "Follow-up" | "InMail";
}

interface MessageTableProps {
  messages: GeneratedMessage[];
  onEdit: (messageId: string, newContent: string) => Promise<void>;
  onEditSubject?: (messageId: string, newSubject: string) => Promise<void>;
  onApprove: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onBulkApprove: (messageIds: string[]) => void;
  onBulkDelete: (messageIds: string[]) => void;
  selectedMessages: string[];
  onSelectedMessagesChange: (messageIds: string[]) => void;
  onClearSelection: () => void;
  isGenerating?: boolean;
  mentionJob?: boolean;
  onMentionJobChange?: (mentionJob: boolean) => void;
  regeneratingMessageIds?: Set<string>;
  savingMessageIds?: Set<string>;
}

export const MessageTable = ({
  messages,
  onEdit,
  onEditSubject,
  onApprove,
  onDelete,
  onBulkApprove,
  onBulkDelete,
  selectedMessages,
  onSelectedMessagesChange,
  onClearSelection,
  isGenerating = false,
  mentionJob = true,
  onMentionJobChange,
  regeneratingMessageIds = new Set(),
  savingMessageIds = new Set(),
}: MessageTableProps) => {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingSubjectContent, setEditingSubjectContent] = useState("");
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const subjectInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea and focus when editing starts
  useEffect(() => {
    if (editingMessageId && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);

      // Auto-resize
      textarea.style.height = "auto";
      textarea.style.height = Math.max(80, textarea.scrollHeight) + "px";
    }
  }, [editingMessageId, editingContent]);

  // Focus subject input when editing starts
  useEffect(() => {
    if (editingSubjectId && subjectInputRef.current) {
      const input = subjectInputRef.current;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }, [editingSubjectId]);

  const handleSelectAll = (checked: boolean) => {
    if (isGenerating || regeneratingMessageIds.size > 0) return;
    
    if (checked) {
      onSelectedMessagesChange(messages.map((m) => m.messageId));
    } else {
      onSelectedMessagesChange([]);
    }
  };

  const handleSelectMessage = (messageId: string, checked: boolean) => {
    if (isGenerating || regeneratingMessageIds.has(messageId) || savingMessageIds.has(messageId)) return;
    
    if (checked) {
      onSelectedMessagesChange([...selectedMessages, messageId]);
    } else {
      onSelectedMessagesChange(
        selectedMessages.filter((id) => id !== messageId)
      );
    }
  };

  const startEditing = (messageId: string, currentMessage: string) => {
    // Don't start editing if message is selected for bulk operations, generating, or being processed
    if (selectedMessages.includes(messageId) || isGenerating || 
        regeneratingMessageIds.has(messageId) || savingMessageIds.has(messageId)) return;

    setEditingMessageId(messageId);
    setEditingContent(currentMessage);
  };

  const startEditingSubject = (messageId: string, currentSubject: string) => {
    // Don't start editing if message is selected for bulk operations, generating, or being processed, or if subject editing is not available
    if (selectedMessages.includes(messageId) || isGenerating || 
        regeneratingMessageIds.has(messageId) || savingMessageIds.has(messageId) || !onEditSubject) return;

    setEditingSubjectId(messageId);
    setEditingSubjectContent(currentSubject);
  };

  const saveEdit = async () => {
    if (editingMessageId && editingContent.trim()) {
      await onEdit(editingMessageId, editingContent.trim());
    }
    setEditingMessageId(null);
    setEditingContent("");
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  const saveSubjectEdit = async () => {
    if (editingSubjectId && editingSubjectContent.trim() && onEditSubject) {
      await onEditSubject(editingSubjectId, editingSubjectContent.trim());
    }
    setEditingSubjectId(null);
    setEditingSubjectContent("");
  };

  const cancelSubjectEdit = () => {
    setEditingSubjectId(null);
    setEditingSubjectContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  };

  const handleSubjectKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveSubjectEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelSubjectEdit();
    }
  };

  const approvedCount = messages.filter((m) => m.approved).length;
  const allSelected =
    selectedMessages.length === messages.length && messages.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2">
              Generated Messages
              <Badge variant="secondary">{messages.length} total</Badge>
              {approvedCount > 0 && (
                <Badge variant="default">{approvedCount} approved</Badge>
              )}
            </CardTitle>
            {onMentionJobChange && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={mentionJob}
                  onCheckedChange={onMentionJobChange}
                  aria-label="Mention the job in messages"
                />
                <span className="text-sm text-muted-foreground">Mention the Job</span>
              </div>
            )}
          </div>
          {selectedMessages.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="default" className="font-medium">
                {selectedMessages.length} selected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                disabled={isGenerating}
                className="h-7 px-2 text-xs"
              >
                Clear selection
              </Button>
            </div>
          )}
        </div>
        <CardDescription>
          Review and approve your personalized messages — crafted by matching jobs and hiring managers to your story and campaign strategy from Design.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isGenerating && messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Generating messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No messages generated yet. Upload your resume to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    disabled={isGenerating || regeneratingMessageIds.size > 0 || savingMessageIds.size > 0}
                    aria-label="Select all messages"
                  />
                </TableHead>
                <TableHead className="w-48">Job & Company</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="generated-messages-table">
              {messages.map((message, index) => (
                <TableRow 
                  key={message.messageId} 
                  className="align-top"
                  id={index === 0 ? "first-generated-message" : undefined}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedMessages.includes(message.messageId)}
                      onCheckedChange={(checked) =>
                        handleSelectMessage(
                          message.messageId,
                          checked as boolean
                        )
                      }
                      disabled={isGenerating || regeneratingMessageIds.has(message.messageId) || savingMessageIds.has(message.messageId)}
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
                      {/* Show individual loading states */}
                      {regeneratingMessageIds.has(message.messageId) ? (
                        <div className="flex items-center gap-2 py-4">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-muted-foreground">Generating message...</span>
                        </div>
                      ) : savingMessageIds.has(message.messageId) ? (
                        <div className="flex items-center gap-2 py-4">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-muted-foreground">Saving changes...</span>
                        </div>
                      ) : editingMessageId === message.messageId ? (
                        <Textarea
                          ref={textareaRef}
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={handleKeyDown}
                          className="min-h-[80px] w-full resize-none border-primary/40 focus:border-primary"
                          placeholder="Edit your message..."
                        />
                      ) : (
                        <div
                          className={`group relative whitespace-pre-wrap text-sm leading-relaxed cursor-text rounded-md p-2 transition-colors ${
                            selectedMessages.includes(message.messageId) || isGenerating || 
                            regeneratingMessageIds.has(message.messageId) || savingMessageIds.has(message.messageId)
                              ? "bg-muted/50 cursor-not-allowed"
                              : "hover:bg-muted/30"
                          }`}
                          onClick={() =>
                            startEditing(message.messageId, message.message)
                          }
                          title={
                            regeneratingMessageIds.has(message.messageId)
                              ? "Cannot edit while message is being regenerated"
                              : savingMessageIds.has(message.messageId)
                              ? "Cannot edit while message is being saved"
                              : isGenerating
                              ? "Cannot edit while generating messages"
                              : selectedMessages.includes(message.messageId)
                              ? "Unselect to edit"
                              : "Click to edit"
                          }
                        >
                          {message.subject && (
                            <div className="font-medium text-foreground mb-2 border-b border-border pb-1">
                              <span className="text-muted-foreground">Subject: </span>
                              {editingSubjectId === message.messageId ? (
                                <Input
                                  ref={subjectInputRef}
                                  value={editingSubjectContent}
                                  onChange={(e) => setEditingSubjectContent(e.target.value)}
                                  onBlur={saveSubjectEdit}
                                  onKeyDown={handleSubjectKeyDown}
                                  className="inline-block w-auto min-w-[200px] h-6 px-2 py-1 text-sm border-primary/40 focus:border-primary"
                                  placeholder="Enter subject..."
                                />
                              ) : (
                                <span 
                                  className={`${
                                    selectedMessages.includes(message.messageId) || isGenerating || 
                                    regeneratingMessageIds.has(message.messageId) || savingMessageIds.has(message.messageId) || !onEditSubject
                                      ? "cursor-not-allowed"
                                      : "cursor-pointer hover:bg-muted/30 rounded px-1"
                                  }`}
                                  onClick={() => startEditingSubject(message.messageId, message.subject)}
                                  title={
                                    !onEditSubject
                                      ? "Subject editing not available"
                                      : regeneratingMessageIds.has(message.messageId)
                                      ? "Cannot edit while message is being regenerated"
                                      : savingMessageIds.has(message.messageId)
                                      ? "Cannot edit while message is being saved"
                                      : isGenerating
                                      ? "Cannot edit while generating messages"
                                      : selectedMessages.includes(message.messageId)
                                      ? "Unselect to edit"
                                      : "Click to edit subject"
                                  }
                                >
                                  {message.subject}
                                </span>
                              )}
                            </div>
                          )}
                          {message.message}
                          {!selectedMessages.includes(message.messageId) && !isGenerating && 
                           !regeneratingMessageIds.has(message.messageId) && !savingMessageIds.has(message.messageId) && (
                            <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm text-muted-foreground/80 font-medium pointer-events-none">
                              edit
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Character count */}
                      <div className="text-xs text-muted-foreground mt-1">
                        {message.message.length} characters
                      </div>
                      
                      {message.approved && (
                        <Badge variant="default" className="text-xs">
                          Approved
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {messages.length > 0 && !bannerDismissed && (
        <div className="px-6 pb-6">
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
                <Mail className="h-4 w-4" />
                <span>These messages are optimized for email outreach. For LinkedIn connection requests, we'll use a shortened version of your approved message that fits their 300-character limit.</span>
                <Linkedin className="h-4 w-4 ml-1" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBannerDismissed(true)}
                className="h-6 w-6 p-0 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
              >
                <X className="h-3 w-3" />
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </Card>
  );
};
