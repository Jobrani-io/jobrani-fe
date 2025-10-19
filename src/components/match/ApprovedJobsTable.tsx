import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { XCircle, ExternalLink, RotateCcw } from "lucide-react";
import { SavedProspect, JobMatch } from "@/services/savedProspectsService";

interface ProcessedJobOpportunity extends SavedProspect {
  enhancedContacts?: JobMatch[];
  autoSelectedContact?: JobMatch | null;
  isApproved?: boolean;
}

interface ApprovedJobsTableProps {
  approvedJobs: ProcessedJobOpportunity[];
  onUnapproveJob: (jobId: string) => void;
}

const ApprovedJobsTable: React.FC<ApprovedJobsTableProps> = ({
  approvedJobs,
  onUnapproveJob,
}) => {
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9)
      return (
        <Badge variant="default" className="text-xs">
          High
        </Badge>
      );
    if (confidence >= 0.6)
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

  if (approvedJobs.length === 0) {
    return (
      <Card className="overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No approved jobs yet.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b bg-green-50/30">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-green-800">
              Approved Jobs
            </h3>
            <p className="text-sm text-green-600">
              {approvedJobs.length} job{approvedJobs.length !== 1 ? "s" : ""}{" "}
              ready for outreach
            </p>
          </div>
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
            {approvedJobs.map((job, index) => {
              const contact = job.autoSelectedContact || null;
              const googleQuery = `${job.autoSelectedContact?.name} ${job.autoSelectedContact?.title} ${job.company} linkedin`;

              const fullGoogleQuery = `https://www.google.com/search?q=${encodeURIComponent(
                `${googleQuery}`
              )}`;

              // Find the first approved job with a hiring manager contact
              const firstApprovedWithContact = approvedJobs.findIndex(j => j.autoSelectedContact);
              const isFirstApprovedMatch = index === firstApprovedWithContact && firstApprovedWithContact !== -1;

              return (
                <TableRow
                  key={job.prospect_id}
                  id={isFirstApprovedMatch ? "first-approved-match" : undefined}
                  className="text-sm bg-green-50/30 hover:bg-green-50/50"
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
                                : window.open(
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
                    ) : (
                      <span className="text-muted-foreground">
                        No contact selected
                      </span>
                    )}
                  </TableCell>

                  {/* Confidence */}
                  <TableCell className="py-3">
                    {contact ? (
                      getConfidenceBadge(contact.confidence)
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
                      <Button
                        onClick={() => onUnapproveJob(job.prospect_id)}
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-xs gap-1 text-orange-600 hover:text-orange-700 border-orange-200 hover:border-orange-300"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Unapprove
                      </Button>
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

export default ApprovedJobsTable;
