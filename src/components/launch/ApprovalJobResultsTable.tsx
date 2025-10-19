import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Eye, Edit3, CheckCircle, RotateCcw } from "lucide-react";

interface JobGroup {
  id: string;
  company: string;
  jobTitle: string;
  industry: string;
  location: string;
  contactsStatus: {
    approved: number;
    pending: number;
    total: number;
  };
  messagesStatus: {
    approved: number;
    pending: number;
    total: number;
  };
}

interface ApprovalJobResultsTableProps {
  jobGroups: JobGroup[];
  completedJobs: Set<string>;
  onReview: (job: JobGroup) => void;
  onMarkComplete: (jobId: string) => void;
  onEditContact: (jobId: string) => void;
  showCompleted: boolean;
  onToggleCompleted: () => void;
}

export function ApprovalJobResultsTable({
  jobGroups,
  completedJobs,
  onReview,
  onMarkComplete,
  onEditContact,
  showCompleted,
  onToggleCompleted,
}: ApprovalJobResultsTableProps) {
  // Categorize jobs based on approval status
  const readyToComplete = jobGroups.filter(job => 
    !completedJobs.has(job.id) &&
    job.contactsStatus.approved === job.contactsStatus.total &&
    job.messagesStatus.approved === job.messagesStatus.total &&
    job.contactsStatus.total > 0
  );

  const needsReview = jobGroups.filter(job => 
    !completedJobs.has(job.id) &&
    (job.contactsStatus.approved < job.contactsStatus.total ||
     job.messagesStatus.approved < job.messagesStatus.total)
  );

  const completed = jobGroups.filter(job => completedJobs.has(job.id));

  const handleBulkComplete = () => {
    readyToComplete.forEach(job => onMarkComplete(job.id));
  };

  const getStatusBadge = (approved: number, total: number) => {
    if (approved === total && total > 0) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Complete</Badge>;
    } else if (approved > 0) {
      return <Badge variant="secondary">In Progress</Badge>;
    } else {
      return <Badge variant="outline">Pending</Badge>;
    }
  };

  const renderJobTable = (jobs: JobGroup[], title: string, titleColor: string, showActions: boolean = true, isReadyToComplete = false) => {
    if (jobs.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-medium ${titleColor} flex items-center gap-2`}>
            {title} ({jobs.length})
          </h3>
          {isReadyToComplete && jobs.length > 0 && (
            <Button 
              onClick={handleBulkComplete} 
              size="sm"
              variant="secondary"
              className="gap-2 h-8 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
            >
              <CheckCircle className="h-4 w-4" />
              Complete All
            </Button>
          )}
        </div>
        
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="h-10">
                <TableHead className="py-2 px-3 text-xs">Company</TableHead>
                <TableHead className="py-2 px-3 text-xs">Job Title</TableHead>
                <TableHead className="py-2 px-3 text-xs">Location</TableHead>
                <TableHead className="py-2 px-3 text-xs">Contacts</TableHead>
                <TableHead className="py-2 px-3 text-xs">Messages</TableHead>
                {showActions && <TableHead className="py-2 px-3 text-xs text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow 
                  key={job.id} 
                  className="h-12 transition-colors hover:bg-muted/50"
                >
                  <TableCell className="py-2 px-3">
                    <div className="text-sm font-medium truncate">
                      {job.company}
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <div className="text-sm truncate">
                      {job.jobTitle}
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <div className="text-xs text-muted-foreground truncate">
                      {job.location}
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    {getStatusBadge(job.contactsStatus.approved, job.contactsStatus.total)}
                    <div className="text-xs text-muted-foreground mt-1">
                      {job.contactsStatus.approved}/{job.contactsStatus.total} approved
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    {getStatusBadge(job.messagesStatus.approved, job.messagesStatus.total)}
                    <div className="text-xs text-muted-foreground mt-1">
                      {job.messagesStatus.approved}/{job.messagesStatus.total} approved
                    </div>
                  </TableCell>
                  {showActions && (
                    <TableCell className="py-2 px-3">
                      <div className="flex justify-end">
                        <TooltipProvider>
                          <div className="flex gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onReview(job)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Review Job</TooltipContent>
                            </Tooltip>
                            {!completedJobs.has(job.id) && (
                              <>
                                {(job.contactsStatus.approved < job.contactsStatus.total ||
                                  job.messagesStatus.approved < job.messagesStatus.total) && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEditContact(job.id)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Edit3 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit Contact</TooltipContent>
                                  </Tooltip>
                                )}
                                {job.contactsStatus.approved === job.contactsStatus.total &&
                                 job.messagesStatus.approved === job.messagesStatus.total &&
                                 job.contactsStatus.total > 0 && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => onMarkComplete(job.id)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Mark Complete</TooltipContent>
                                  </Tooltip>
                                )}
                              </>
                            )}
                            {completedJobs.has(job.id) && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onMarkComplete(job.id)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Mark Incomplete</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Job Review Status</CardTitle>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {readyToComplete.length} ready to complete • {needsReview.length} need review • {completed.length} completed
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleCompleted}
            >
              {showCompleted ? "Hide" : "Show"} Completed
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderJobTable(readyToComplete, "Ready to Complete", "text-green-700", true, true)}
        {renderJobTable(needsReview, "Review Needed", "text-amber-700", true, false)}
        {showCompleted && renderJobTable(completed, "Completed", "text-muted-foreground", true, false)}
      </CardContent>
    </Card>
  );
}