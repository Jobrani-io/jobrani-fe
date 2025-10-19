import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MessageSquare, Users, Globe } from 'lucide-react';
import { messageGenerator, ProspectData } from '@/services/messageGenerator';

interface MessagePreviewPanelProps {
  actionType: string;
  messageType?: 'message' | 'inmail';
  visible: boolean;
}

const sampleProspects: ProspectData[] = [
  { firstName: 'Jane', lastName: 'Smith', company: 'TechCorp', jobTitle: 'Product Manager', industry: 'Technology' },
  { firstName: 'Michael', lastName: 'Johnson', company: 'InnovateLabs', jobTitle: 'Engineering Director', industry: 'Software' },
  { firstName: 'Sarah', lastName: 'Chen', company: 'DataFlow Inc', jobTitle: 'VP of Marketing', industry: 'Analytics' }
];

const MessagePreviewPanel: React.FC<MessagePreviewPanelProps> = ({
  actionType,
  messageType = 'message',
  visible
}) => {
  const [currentProspectIndex, setCurrentProspectIndex] = useState(0);
  const currentProspect = sampleProspects[currentProspectIndex];

  const navigateProspect = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentProspectIndex > 0) {
      setCurrentProspectIndex(currentProspectIndex - 1);
    } else if (direction === 'next' && currentProspectIndex < sampleProspects.length - 1) {
      setCurrentProspectIndex(currentProspectIndex + 1);
    }
  };

  const getPreviewMessage = () => {
    switch (actionType) {
      case 'connection-request':
        return messageGenerator.generateConnectionRequest(currentProspect);
      case 'send-message':
        return messageType === 'inmail' 
          ? messageGenerator.generateInMail(currentProspect)
          : messageGenerator.generateFollowUpMessage(currentProspect);
      default:
        return messageGenerator.generateConnectionRequest(currentProspect);
    }
  };

  const getActionTitle = () => {
    switch (actionType) {
      case 'connection-request':
        return 'Connection Request';
      case 'send-message':
        return messageType === 'inmail' ? 'InMail Message' : 'Follow-up Message';
      default:
        return 'Message';
    }
  };

  const getActionIcon = () => {
    if (actionType === 'send-message') {
      return messageType === 'inmail' ? Globe : Users;
    }
    return MessageSquare;
  };

  const ActionIcon = getActionIcon();

  if (!visible) return null;

  return (
    <Card className="w-80 h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <ActionIcon className="h-4 w-4" />
          {getActionTitle()} Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Prospect Navigation */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Preview for:</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateProspect('prev')}
              disabled={currentProspectIndex === 0}
              className="h-6 w-6 p-0"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {currentProspectIndex + 1} of {sampleProspects.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateProspect('next')}
              disabled={currentProspectIndex === sampleProspects.length - 1}
              className="h-6 w-6 p-0"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Prospect Info */}
        <div className="text-xs text-muted-foreground">
          <div className="font-medium text-foreground">
            {currentProspect.firstName} {currentProspect.lastName}
          </div>
          <div>{currentProspect.jobTitle} at {currentProspect.company}</div>
          <div>{currentProspect.industry}</div>
        </div>

        {/* Message Preview */}
        <div className="bg-muted/50 border rounded-lg p-3 text-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
              You
            </div>
            <span className="text-xs text-muted-foreground">via LinkedIn</span>
          </div>
          <div className="text-sm leading-relaxed">
            {getPreviewMessage()}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          ✨ Auto-generated based on your Write Module preferences
        </div>
      </CardContent>
    </Card>
  );
};

export default MessagePreviewPanel;