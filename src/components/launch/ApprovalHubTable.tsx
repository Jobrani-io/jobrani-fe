import React, { useState, useMemo } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { JobReviewDrawer } from './JobReviewDrawer';
import { SAMPLE_PROSPECTS, getProspectMessages, getApprovalStats } from '@/data/sampleProspects';
import type { ProspectApproval } from '@/data/sampleProspects';

interface JobGroup {
  id: string;
  company: string;
  jobTitle: string;
  industry: string;
  location: string;
  prospects: any[];
  contactsStatus: { approved: number; total: number };
  messagesStatus: { approved: number; total: number };
}

interface ApprovalHubTableProps {
  prospectApprovals: Record<string, ProspectApproval>;
  onProspectApproval: (prospectId: string, status: 'approved' | 'rejected', notes?: string) => void;
  onBulkApproval: (prospectIds: string[], status: 'approved' | 'rejected') => void;
}

export function ApprovalHubTable({
  prospectApprovals,
  onProspectApproval,
  onBulkApproval,
}: ApprovalHubTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<JobGroup | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const jobGroups = useMemo(() => {
    // Group prospects by company + job title
    const groups = new Map<string, JobGroup>();

    SAMPLE_PROSPECTS.forEach(prospect => {
      const key = `${prospect.company}-${prospect.title}`;
      if (!groups.has(key)) {
        groups.set(key, {
          id: key,
          company: prospect.company,
          jobTitle: prospect.title,
          industry: prospect.industry,
          location: prospect.location,
          prospects: [],
          contactsStatus: { approved: 0, total: 0 },
          messagesStatus: { approved: 0, total: 0 },
        });
      }
      groups.get(key)!.prospects.push(prospect);
    });

    // Calculate status for each group
    return Array.from(groups.values()).map(group => {
      const groupApprovals = group.prospects.map(p => prospectApprovals[p.id]).filter(Boolean);
      const approved = groupApprovals.filter(a => a.status === 'approved').length;
      const total = group.prospects.length;
      
      // Calculate messages status
      const totalMessages = group.prospects.reduce((acc, prospect) => {
        return acc + getProspectMessages(prospect.id).length;
      }, 0);
      const approvedMessages = Math.floor(totalMessages * 0.7); // Mock calculation

      return {
        ...group,
        contactsStatus: { approved, total },
        messagesStatus: { approved: approvedMessages, total: totalMessages },
      };
    });
  }, [prospectApprovals]);

  const filteredJobs = useMemo(() => {
    return jobGroups.filter(job => {
      const matchesSearch = 
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [jobGroups, searchTerm]);

  const handleReview = (job: JobGroup) => {
    setSelectedJob(job);
    setDrawerOpen(true);
  };

  const handleApproveAll = (job: JobGroup) => {
    const prospectIds = job.prospects.map(p => p.id);
    onBulkApproval(prospectIds, 'approved');
  };

  const handleDeclineAll = (job: JobGroup) => {
    const prospectIds = job.prospects.map(p => p.id);
    onBulkApproval(prospectIds, 'rejected');
  };

  const getStatusBadge = (approved: number, total: number) => {
    if (approved === total && total > 0) {
      return <Badge className="bg-green-100 text-green-800">Complete</Badge>;
    } else if (approved > 0) {
      return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Approval Hub - Jobs Overview</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve All Messages
            </Button>
          </div>
        </CardTitle>
        
        {/* Filters and Search */}
        <div className="flex gap-4 mt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by job title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Contacts</TableHead>
              <TableHead>Messages</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{job.company}</div>
                    <div className="text-sm text-muted-foreground">{job.industry}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{job.jobTitle}</div>
                    <div className="text-sm text-muted-foreground">{job.location}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {job.contactsStatus.approved}/{job.contactsStatus.total} Approved
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {job.messagesStatus.approved}/{job.messagesStatus.total} Ready
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReview(job)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleApproveAll(job)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDeclineAll(job)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {selectedJob && (
          <JobReviewDrawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            jobGroup={selectedJob}
            prospectApprovals={prospectApprovals}
            onProspectApproval={onProspectApproval}
            onBulkApproval={onBulkApproval}
          />
        )}
      </CardContent>
    </Card>
  );
}