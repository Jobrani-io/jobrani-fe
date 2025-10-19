import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { JobMatch, SavedProspect } from "@/services/savedProspectsService";
import { CheckCheck, ExternalLink, TrendingUp } from "lucide-react";
import React from "react";

interface ProcessedJobOpportunity extends SavedProspect {
  enhancedContacts?: JobMatch[];
  autoSelectedContact?: JobMatch | null; // preferred > pending > best
  isApproved?: boolean;
}

interface JobMatchTableProps {
  jobs: SavedProspect[];
  enhancedJobs: ProcessedJobOpportunity[];
  approvedJobs: Set<string>;
  onApproveJob: (jobId: string) => void;
  onRejectJob: (jobId: string) => void;
  onChangeContact: (jobId: string) => void;
  onBulkApprove: (jobIds: string[]) => void;
  onMatchProspect: (prospect: SavedProspect) => void; // NEW
  isLoadingMatches: Set<string>;
}

const JobMatchTable: React.FC<JobMatchTableProps> = ({
  jobs,
  enhancedJobs,
  approvedJobs,
  onApproveJob,
  onRejectJob,
  onChangeContact,
  onBulkApprove,
  onMatchProspect, // NEW
  isLoadingMatches,
}) => {
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80)
      return (
        <Badge variant="default" className="text-xs">
          High
        </Badge>
      );
    if (confidence >= 60)
      return (
        <Badge variant="secondary" className="text-xs">
          Medium
        </Badge>
      );
    return (
      <Badge variant="outline" className="text-xs">
        Low
      </Badge>
    );
  };

  const highConfidenceJobs = enhancedJobs.filter(
    (job) =>
      job.autoSelectedContact &&
      job.autoSelectedContact.confidence >= 80 &&
      !approvedJobs.has(job.prospect_id)
  );

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Hiring Manager Matches</h3>
            <p className="text-sm text-muted-foreground">
              {enhancedJobs.length} pending approval
            </p>
          </div>
          {highConfidenceJobs.length > 0 && (
            <Button
              onClick={() =>
                onBulkApprove(highConfidenceJobs.map((job) => job.prospect_id))
              }
              size="sm"
              variant="default"
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Approve {highConfidenceJobs.length} High Confidence
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="text-xs">
              <TableHead className="font-medium">Job</TableHead>
              <TableHead className="font-medium">Contact</TableHead>
              <TableHead className="font-medium">Confidence</TableHead>
              <TableHead className="font-medium">Rationale</TableHead>
              <TableHead className="font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enhancedJobs.map((job, index) => {
              const isApproved =
                approvedJobs.has(job.prospect_id) || !!job.isApproved;

              const googleQuery = `${job.autoSelectedContact?.name} ${job.autoSelectedContact?.title} ${job.company} linkedin`;

              const fullGoogleQuery = `https://www.google.com/search?q=${encodeURIComponent(
                `${googleQuery}`
              )}`;

              const contact = job.autoSelectedContact || null;
              const hasMatches = (job.enhancedContacts?.length ?? 0) > 0;
              const isLoading = isLoadingMatches.has(job.prospect_id);

              // Find the first pending job with a hiring manager contact
              const firstPendingWithContact = enhancedJobs.findIndex(j => 
                !approvedJobs.has(j.prospect_id) && 
                !j.isApproved && 
                j.autoSelectedContact && 
                (j.enhancedContacts?.length ?? 0) > 0
              );
              const isFirstPendingMatch = index === firstPendingWithContact && firstPendingWithContact !== -1;

              return (
                <TableRow
                  key={job.prospect_id}
                  id={isFirstPendingMatch ? "first-pending-match" : undefined}
                  className={`text-sm ${
                    isApproved ? "bg-green-50/50" : "hover:bg-muted/50"
                  }`}
                >
                  {/* Job */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <span className="font-semibold">{job.company}</span>
                        <span className="text-muted-foreground"> • </span>
                        <span
                          className="text-primary hover:underline cursor-pointer"
                          onClick={() =>
                            job.url &&
                            window.open(
                              job.url,
                              "_blank",
                              "noopener,noreferrer"
                            )
                          }
                        >
                          {job.job_title}
                        </span>
                      </div>
                      {job.url && (
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>

                  {/* Contact */}
                  <TableCell className="py-3">
                    {contact ? (
                      <div className="flex items-center gap-2">
                        <div>
                          <span
                            className="font-semibold text-primary hover:underline cursor-pointer"
                            onClick={() =>
                              contact.linkedin_url
                                ? window.open(
                                    contact.linkedin_url,
                                    "_blank",
                                    "noopener,noreferrer"
                                  )
                                : // open google search with <name company title></name> linkedin ?
                                  window.open(
                                    `${fullGoogleQuery}`,
                                    "_blank",
                                    "noopener,noreferrer"
                                  )
                            }
                          >
                            {contact.name}
                          </span>
                          <span className="text-muted-foreground"> • </span>
                          <span className="text-muted-foreground">
                            {contact.title}
                          </span>
                        </div>
                        {contact.linkedin_url && (
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    ) : hasMatches ? (
                      <span className="text-muted-foreground">
                        No hiring manager found
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        No matches generated yet
                      </span>
                    )}
                  </TableCell>

                  {/* Confidence */}
                  <TableCell className="py-3">
                    {contact ? (
                      getConfidenceBadge(contact.confidence * 100)
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        No Match
                      </Badge>
                    )}
                  </TableCell>

                  {/* Rationale */}
                  <TableCell className="py-3 text-muted-foreground max-w-xs">
                    <span className="text-xs">{contact?.reason || "--"}</span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right py-3">
                    <div className="flex items-center justify-end gap-1">
                      {!isApproved && hasMatches && contact && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onChangeContact(job.prospect_id)}
                            className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => onApproveJob(job.prospect_id)}
                            size="sm"
                            variant="default"
                            className="h-8 px-3 text-xs"
                          >
                            Approve
                          </Button>
                        </>
                      )}

                      {!isApproved && hasMatches && !contact && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onChangeContact(job.prospect_id)}
                            className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => onApproveJob(job.prospect_id)}
                            size="sm"
                            variant="default"
                            className="h-8 px-3 text-xs"
                          >
                            Approve
                          </Button>
                        </>
                      )}

                      {!isApproved && !hasMatches && (
                        <div className="flex items-center gap-2">
                          {isLoading ? (
                            <>
                              <TrendingUp className="h-4 w-4 animate-spin" />
                              <span className="text-xs">Finding...</span>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 text-xs gap-1"
                              onClick={() => onMatchProspect(job)}
                            >
                              <TrendingUp className="h-4 w-4" />
                              Find Matches
                            </Button>
                          )}
                        </div>
                      )}

                      {isApproved && (
                        <Badge variant="default" className="text-xs">
                          Approved
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default JobMatchTable;
