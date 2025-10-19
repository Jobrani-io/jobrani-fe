import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { 
  Building, 
  Users, 
  MessageSquare, 
  CheckSquare, 
  XSquare,
  ThumbsUp,
  ThumbsDown,
  User,
  MapPin
} from 'lucide-react';
import { SAMPLE_PROSPECTS, getProspectMessages, type ProspectJob, type ProspectApproval } from '@/data/sampleProspects';

interface CompanyGroup {
  company: string;
  industry: string;
  location: string;
  prospects: ProspectJob[];
  messages: any[];
}

interface CompanyCarouselProps {
  prospectApprovals: Record<string, ProspectApproval>;
  onProspectApproval: (prospectId: string, status: 'approved' | 'rejected', notes?: string) => void;
  onBulkApproval: (prospectIds: string[], status: 'approved' | 'rejected') => void;
}

export const CompanyCarousel: React.FC<CompanyCarouselProps> = ({
  prospectApprovals,
  onProspectApproval,
  onBulkApproval
}) => {
  // Group prospects by company
  const companyGroups: CompanyGroup[] = SAMPLE_PROSPECTS.reduce((groups, prospect) => {
    const existingGroup = groups.find(g => g.company === prospect.company);
    if (existingGroup) {
      existingGroup.prospects.push(prospect);
      // Add messages for this prospect
      const messages = getProspectMessages(prospect.id);
      existingGroup.messages.push(...messages);
    } else {
      const messages = getProspectMessages(prospect.id);
      groups.push({
        company: prospect.company,
        industry: prospect.industry,
        location: prospect.location,
        prospects: [prospect],
        messages: messages
      });
    }
    return groups;
  }, [] as CompanyGroup[]);

  const handleBulkCompanyApproval = (companyGroup: CompanyGroup, status: 'approved' | 'rejected') => {
    const prospectIds = companyGroup.prospects.map(p => p.id);
    onBulkApproval(prospectIds, status);
  };

  const getCompanyApprovalStats = (prospects: ProspectJob[]) => {
    const total = prospects.length;
    const approved = prospects.filter(p => prospectApprovals[p.id]?.status === 'approved').length;
    const rejected = prospects.filter(p => prospectApprovals[p.id]?.status === 'rejected').length;
    const pending = total - approved - rejected;
    return { total, approved, rejected, pending };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Company-based Prospect Review
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Carousel className="w-full">
          <CarouselContent>
            {companyGroups.map((companyGroup, index) => {
              const stats = getCompanyApprovalStats(companyGroup.prospects);
              
              return (
                <CarouselItem key={index}>
                  <div className="space-y-4">
                    {/* Company Header */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Building className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{companyGroup.company}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {companyGroup.industry}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {companyGroup.location}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {stats.approved}/{stats.total} Approved
                          </Badge>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleBulkCompanyApproval(companyGroup, 'approved')}
                              disabled={stats.pending === 0}
                            >
                              <CheckSquare className="h-3 w-3 mr-1" />
                              Approve All
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleBulkCompanyApproval(companyGroup, 'rejected')}
                              disabled={stats.pending === 0}
                            >
                              <XSquare className="h-3 w-3 mr-1" />
                              Reject All
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Tabs for Prospects and Messages */}
                      <Tabs defaultValue="prospects" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="prospects" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Prospects ({companyGroup.prospects.length})
                          </TabsTrigger>
                          <TabsTrigger value="messages" className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Messages ({companyGroup.messages.length})
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="prospects" className="space-y-3 mt-4">
                          {companyGroup.prospects.map((prospect) => {
                            const approval = prospectApprovals[prospect.id];
                            const status = approval?.status || 'pending';
                            
                            return (
                              <div key={prospect.id} className="border rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                      <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium">{prospect.name}</h4>
                                      <p className="text-sm text-muted-foreground">{prospect.title}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      variant={status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary'}
                                    >
                                      {status}
                                    </Badge>
                                    {status === 'pending' && (
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => onProspectApproval(prospect.id, 'approved')}
                                        >
                                          <ThumbsUp className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => onProspectApproval(prospect.id, 'rejected')}
                                        >
                                          <ThumbsDown className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </TabsContent>
                        
                        <TabsContent value="messages" className="space-y-3 mt-4">
                          {companyGroup.messages.map((message, idx) => (
                            <div key={idx} className="border rounded-lg p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline">Step {message.step}</Badge>
                                    <Badge variant="secondary">{message.type}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {message.content.substring(0, 100)}...
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </CardContent>
    </Card>
  );
};