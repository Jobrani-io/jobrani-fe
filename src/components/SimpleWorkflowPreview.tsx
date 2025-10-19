import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, FileText, Mail, Bell, Play } from 'lucide-react';

type ActionType = 'connect' | 'apply' | 'email';

interface Action {
  id: ActionType;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
}

const actions: Action[] = [
  {
    id: 'connect',
    label: 'Send LinkedIn Connection',
    description: 'Connect with hiring managers and key contacts',
    icon: UserPlus,
  },
  {
    id: 'apply',
    label: 'Apply for the Job',
    description: 'Submit your application to the position',
    icon: FileText,
  },
  {
    id: 'email',
    label: 'Send Email to Hiring Manager',
    description: 'Send personalized email outreach',
    icon: Mail,
  },
];

interface SimpleWorkflowPreviewProps {
  selectedActions: ActionType[];
  actionOrder: ActionType[];
  className?: string;
}

const SimpleWorkflowPreview: React.FC<SimpleWorkflowPreviewProps> = ({ 
  selectedActions, 
  actionOrder, 
  className = "" 
}) => {
  const orderedSelectedActions = actionOrder.filter(id => selectedActions.includes(id));

  if (selectedActions.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-full p-8 text-center ${className}`}>
        <div className="p-4 rounded-full bg-muted/50 mb-4">
          <Play className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-2">Your Workflow Preview</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Select actions from the left panel to see your workflow preview here
        </p>
      </div>
    );
  }

  return (
    <div className={`p-3 md:p-6 h-full overflow-y-auto ${className}`}>
      <div className="max-w-md mx-auto space-y-2 md:space-y-4">
        {/* Start Campaign Card */}
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Play className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-primary">Start Campaign</div>
                <div className="text-sm text-muted-foreground">Begin your outreach sequence</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connecting Line */}
        {orderedSelectedActions.length > 0 && (
          <div className="flex justify-center">
            <div className="w-0.5 h-4 md:h-6 bg-border"></div>
          </div>
        )}

        {/* Action Cards */}
        {orderedSelectedActions.map((actionId, index) => {
          const action = actions.find(a => a.id === actionId);
          if (!action) return null;

          const Icon = action.icon;
          const showAutoMessage = actionId === 'connect' || actionId === 'email';

          return (
            <React.Fragment key={actionId}>
              <Card className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{action.label}</div>
                      <div className="text-sm text-muted-foreground">{action.description}</div>
                      {showAutoMessage && (
                        <Badge variant="secondary" className="text-xs mt-2">
                          Auto-message
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {index + 1}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Connecting Line */}
              {index < orderedSelectedActions.length - 1 && (
                <div className="flex justify-center">
                  <div className="w-0.5 h-4 md:h-6 bg-border"></div>
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Connecting Line to Notify */}
        {orderedSelectedActions.length > 0 && (
          <div className="flex justify-center">
            <div className="w-0.5 h-4 md:h-6 bg-border"></div>
          </div>
        )}

        {/* Notify Me Card */}
        <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-800/50">
                <Bell className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="font-semibold text-green-800 dark:text-green-200">Notify Me</div>
                <div className="text-sm text-green-600 dark:text-green-300">Get notified when complete</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimpleWorkflowPreview;