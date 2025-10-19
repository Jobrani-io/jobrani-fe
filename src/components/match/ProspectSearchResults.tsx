import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Eye, EyeOff, CheckCheck, RotateCcw, ExternalLink } from 'lucide-react';
import { ProspectSearchResult, ProspectSearchStats } from '@/types/prospectSearch';

interface ProspectSearchResultsProps {
  prospects: ProspectSearchResult[];
  stats: ProspectSearchStats;
  showCompleted: boolean;
  onToggleCompleted: () => void;
  onMarkComplete: (prospectId: string) => void;
  onBulkComplete: () => void;
}

const ProspectSearchResults: React.FC<ProspectSearchResultsProps> = ({
  prospects,
  stats,
  showCompleted,
  onToggleCompleted,
  onMarkComplete,
  onBulkComplete
}) => {
  const readyToComplete = prospects.filter(p => !p.isCompleted);
  const completed = prospects.filter(p => p.isCompleted);

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const renderProspectTable = (prospects: ProspectSearchResult[], title: string, titleColor: string, isReadyToComplete = false) => {
    if (prospects.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-medium ${titleColor} flex items-center gap-2`}>
            {title} ({prospects.length})
          </h3>
          {isReadyToComplete && prospects.length > 0 && (
            <Button
              onClick={onBulkComplete}
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
                <TableHead className="py-2 px-3 text-xs">Name</TableHead>
                <TableHead className="py-2 px-3 text-xs">Company Name</TableHead>
                <TableHead className="py-2 px-3 text-xs">Job Title</TableHead>
                <TableHead className="py-2 px-3 text-xs">Location</TableHead>
                <TableHead className="py-2 px-3 text-xs">LinkedIn URL</TableHead>
                <TableHead className="py-2 px-3 text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prospects.map((prospect) => (
                <TableRow 
                  key={prospect.id} 
                  className="h-12 transition-colors hover:bg-muted/50"
                >
                  <TableCell className="py-2 px-3">
                    <div className="text-sm font-medium">
                      {prospect.name}
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <div className="text-sm">
                      {prospect.companyName}
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <div className="text-sm">
                      {prospect.jobTitle}
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <div className="text-sm text-muted-foreground">
                      {prospect.location}
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <a 
                      href={`https://${prospect.linkedinUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      {prospect.linkedinUrl}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell className="py-2 px-3 text-right">
                    <Button
                      onClick={() => onMarkComplete(prospect.id)}
                      size="sm"
                      variant={prospect.isCompleted ? "outline" : "default"}
                      className="h-8 w-8 p-0"
                    >
                      {prospect.isCompleted ? (
                        <RotateCcw className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </Button>
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
        {/* Results Summary */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Previewing {formatNumber(stats.previewing)} of {formatNumber(stats.total)} results. {formatNumber(stats.willBeImported)} will be imported.
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

        {/* Ready to Complete First */}
        {renderProspectTable(readyToComplete, "Ready to Complete", "text-green-700", true)}

        {/* Completed Last (if showing) */}
        {showCompleted && renderProspectTable(completed, "Saved", "text-muted-foreground")}

        {/* Empty State */}
        {prospects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No prospects found with current filters.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProspectSearchResults;