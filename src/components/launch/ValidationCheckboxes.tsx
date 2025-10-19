import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Linkedin,
  Users,
  MessageSquare,
  Calendar
} from 'lucide-react';

interface ValidationItem {
  id: string;
  label: string;
  description: string;
  status: 'complete' | 'incomplete' | 'warning';
  icon: React.ReactNode;
}

interface ValidationCheckboxesProps {
  linkedInConnected: boolean;
  prospectListSelected: boolean;
  messagesApproved: boolean;
  scheduleConfigured: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export const ValidationCheckboxes: React.FC<ValidationCheckboxesProps> = ({
  linkedInConnected,
  prospectListSelected,
  messagesApproved,
  scheduleConfigured,
  isOpen,
  onToggle
}) => {
  const validationItems: ValidationItem[] = [
    {
      id: 'linkedin',
      label: 'LinkedIn Connected',
      description: 'LinkedIn account is connected and authenticated',
      status: linkedInConnected ? 'complete' : 'incomplete',
      icon: <Linkedin className="h-4 w-4" />
    },
    {
      id: 'prospects',
      label: 'Prospect List Selected',
      description: 'Target prospect list has been chosen and validated',
      status: prospectListSelected ? 'complete' : 'incomplete',
      icon: <Users className="h-4 w-4" />
    },
    {
      id: 'messages',
      label: 'Messages Approved',
      description: 'All personalized messages have been reviewed and approved',
      status: messagesApproved ? 'complete' : 'incomplete',
      icon: <MessageSquare className="h-4 w-4" />
    },
    {
      id: 'schedule',
      label: 'Schedule Configured',
      description: 'Working hours and messaging schedule have been set',
      status: scheduleConfigured ? 'complete' : 'incomplete',
      icon: <Calendar className="h-4 w-4" />
    }
  ];

  const completedCount = validationItems.filter(item => item.status === 'complete').length;
  const totalCount = validationItems.length;
  const allComplete = completedCount === totalCount;

  const getStatusIcon = (status: ValidationItem['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: ValidationItem['status']) => {
    switch (status) {
      case 'complete':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-red-600';
    }
  };

  return (
    <div className="border rounded-lg">
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5" />
              <div className="text-left">
                <h3 className="font-semibold">Final Validation</h3>
                <p className="text-sm text-muted-foreground">
                  {completedCount}/{totalCount} requirements completed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={allComplete ? "default" : "destructive"}>
                {completedCount}/{totalCount}
              </Badge>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            {/* Overall Status */}
            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                {allComplete ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium">
                    {allComplete ? 'Ready to Launch' : 'Requirements Incomplete'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {allComplete 
                      ? 'All validation requirements have been met'
                      : `${totalCount - completedCount} requirement${totalCount - completedCount !== 1 ? 's' : ''} remaining`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Individual Validation Items */}
            <div className="space-y-3">
              {validationItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Checkbox
                    checked={item.status === 'complete'}
                    disabled
                    className="mt-0.5"
                  />
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.label}</span>
                        {getStatusIcon(item.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                      <p className={`text-xs mt-1 font-medium ${getStatusColor(item.status)}`}>
                        {item.status === 'complete' ? 'Complete' : 'Incomplete'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Launch Readiness Message */}
            <div className="pt-4 border-t">
              {allComplete ? (
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Campaign Ready for Launch</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    All requirements have been met. You can now launch your campaign.
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span className="font-medium">Complete Required Steps</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Please complete all validation requirements before launching your campaign.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};