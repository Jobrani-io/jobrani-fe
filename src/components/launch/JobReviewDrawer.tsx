import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ContactsTab } from './ContactsTab';
import { MessagesTab } from './MessagesTab';
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

interface JobReviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobGroup: JobGroup;
  prospectApprovals: Record<string, ProspectApproval>;
  onProspectApproval: (prospectId: string, status: 'approved' | 'rejected', notes?: string) => void;
  onBulkApproval: (prospectIds: string[], status: 'approved' | 'rejected') => void;
}

export function JobReviewDrawer({
  open,
  onOpenChange,
  jobGroup,
  prospectApprovals,
  onProspectApproval,
  onBulkApproval,
}: JobReviewDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:w-[700px]">
        <SheetHeader>
          <SheetTitle>
            Review: {jobGroup.jobTitle} at {jobGroup.company}
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            {jobGroup.industry} • {jobGroup.location} • {jobGroup.prospects.length} contacts
          </p>
        </SheetHeader>

        <div className="mt-6">
          <Tabs defaultValue="contacts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="contacts">
                🔹 Contacts ({jobGroup.contactsStatus.approved}/{jobGroup.contactsStatus.total})
              </TabsTrigger>
              <TabsTrigger value="messages">
                🔹 Messages ({jobGroup.messagesStatus.approved}/{jobGroup.messagesStatus.total})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="contacts" className="mt-4">
              <ContactsTab
                prospects={jobGroup.prospects}
                prospectApprovals={prospectApprovals}
                onProspectApproval={onProspectApproval}
                onBulkApproval={onBulkApproval}
              />
            </TabsContent>

            <TabsContent value="messages" className="mt-4">
              <MessagesTab
                prospects={jobGroup.prospects}
                prospectApprovals={prospectApprovals}
                onProspectApproval={onProspectApproval}
              />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}