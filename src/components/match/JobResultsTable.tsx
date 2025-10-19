import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { CheckCircle, AlertTriangle, XCircle, Edit3, Eye, EyeOff, CheckCheck, RotateCcw } from 'lucide-react';
import { JobOpportunity } from '@/data/jobOpportunities';

interface JobResultsTableProps {
  jobs: JobOpportunity[];
  onMarkComplete: (jobId: string) => void;
  onEditContact: (jobId: string) => void;
  showCompleted: boolean;
  onToggleCompleted: () => void;
  selectedStrategy?: string;
}

const JobResultsTable: React.FC<JobResultsTableProps> = ({ 
  jobs, 
  onMarkComplete, 
  onEditContact, 
  showCompleted,
  onToggleCompleted,
  selectedStrategy
}) => {
  // Reorder: Ready to Complete first, then Review Needed
  const readyToComplete = jobs.filter(job => !job.isCompleted && job.matchStatus === 'matched');
  const needsReview = jobs.filter(job => !job.isCompleted && (job.matchStatus === 'multiple-matches' || job.matchStatus === 'no-match'));
  const completed = jobs.filter(job => job.isCompleted);

  const handleBulkComplete = () => {
    readyToComplete.forEach(job => {
      onMarkComplete(job.id);
    });
    // Auto-show completed section when jobs are completed
    if (!showCompleted) {
      onToggleCompleted();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'matched':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 text-xs">
            Matched
          </Badge>
        );
      case 'multiple-matches':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
            Multiple Matches
          </Badge>
        );
      case 'no-match':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200 text-xs">
            No Match
          </Badge>
        );
      default:
        return null;
    }
  };

  const renderJobTable = (jobs: JobOpportunity[], title: string, titleColor: string, isReadyToComplete = false) => {
    if (jobs.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-medium ${titleColor} flex items-center gap-2`}>
            {title} ({jobs.length})
          </h3>
          {/* Complete All button for Ready to Complete */}
          {isReadyToComplete && jobs.length > 0 && (
            <Button
              onClick={handleBulkComplete}
              size="sm"
              variant="secondary"
              className="gap-2 h-8 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
            >
              <CheckCheck className="h-4 w-4" />
              Complete All
            </Button>
          )}
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="h-10">
                <TableHead className="py-2 px-3 text-xs">Job</TableHead>
                <TableHead className="py-2 px-3 text-xs">Contact Match</TableHead>
                <TableHead className="py-2 px-3 text-xs">Status</TableHead>
                <TableHead className="py-2 px-3 text-xs text-right">Actions</TableHead>
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
                      {job.company} — {job.jobTitle}
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    {job.matchStatus === 'matched' && job.selectedContactId ? (
                      (() => {
                        const selectedContact = job.potentialContacts.find(c => c.id === job.selectedContactId);
                        return selectedContact ? (
                          <div className="text-xs truncate">
                            <span className="font-medium">{selectedContact.name}</span>
                            <span className="text-muted-foreground"> • {selectedContact.title}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        );
                      })()
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    {getStatusBadge(job.matchStatus)}
                  </TableCell>
                  <TableCell className="py-2 px-3 text-right">
                    <TooltipProvider>
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {job.matchStatus !== 'matched' && (
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
                            <TooltipContent>
                              <p>Edit Contact</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        
                        {job.matchStatus === 'matched' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => onMarkComplete(job.id)}
                                size="sm"
                                variant={job.isCompleted ? "outline" : "default"}
                                className="h-8 w-8 p-0"
                              >
                                {job.isCompleted ? (
                                  <RotateCcw className="h-4 w-4" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{job.isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-4 overflow-y-auto h-full">
      <div className="space-y-4">
        {/* Statistics Header */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {readyToComplete.length} ready to complete • {needsReview.length} need review • {completed.length} completed
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleCompleted}
            className="gap-2"
          >
            {showCompleted ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showCompleted ? 'Hide' : 'Show'} Completed
          </Button>
        </div>

        {/* Ready to Complete First - Priority */}
        {renderJobTable(readyToComplete, "Ready to Complete", "text-green-700", true)}

        {/* Review Needed Second */}
        {renderJobTable(needsReview, "Review Needed", "text-amber-700")}

        {/* Completed Last (if showing) */}
        {showCompleted && renderJobTable(completed, "Complete", "text-muted-foreground")}

        {/* Empty State */}
        {jobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No job opportunities found with current filters.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default JobResultsTable;