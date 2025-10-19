import React from 'react';
import { Eye, UserPlus, Mail, MessageSquare, Send, Clock, GitBranch, Users, FileText, Bell } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SuggestedWorkflows from './SuggestedWorkflows';
import { Campaign } from '@/hooks/useCampaigns';

const nodeCategories = [
  {
    title: '',
    nodes: [
      {
        type: 'connection-request',
        label: 'Send Connection',
        icon: 'UserPlus',
        description: 'Connect on LinkedIn',
        color: 'from-green-400 to-emerald-500',
        nodeType: 'action',
      },
      {
        type: 'send-message',
        label: 'Send Message',
        icon: 'Mail',
        description: 'LinkedIn message or InMail',
        color: 'from-indigo-400 to-purple-500',
        nodeType: 'channel',
      },
      {
        type: 'view-profile',
        label: 'View Profile',
        icon: 'Eye',
        description: 'Visit prospect\'s profile',
        color: 'from-blue-400 to-cyan-500',
        nodeType: 'action',
      },
      {
        type: 'apply-to-job',
        label: 'Apply to Job',
        icon: 'FileText',
        description: 'Submit job application',
        color: 'from-orange-400 to-amber-500',
        nodeType: 'action',
      },
      {
        type: 'notify-me',
        label: 'Notify Me',
        icon: 'Bell',
        description: 'Get notified when triggered',
        color: 'from-pink-400 to-rose-500',
        nodeType: 'action',
      },
    ]
  }
];

// Icon mapping for rendering
const iconMap = {
  UserPlus,
  Mail,
  Eye,
  MessageSquare,
  Clock,
  GitBranch,
  FileText,
  Bell,
};

interface NodePaletteProps {
  onLoadTemplate?: (template: any) => void;
  selectedList?: Campaign | null;
  onListChange?: (listId: string) => void;
  allLists?: Campaign[];
}

const NodePalette: React.FC<NodePaletteProps> = ({ 
  onLoadTemplate, 
  selectedList, 
  onListChange, 
  allLists = []
}) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    const nodeData = nodeCategories
      .flatMap(category => category.nodes)
      .find(node => node.type === nodeType);
    
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      type: nodeType,
      nodeData: nodeData
    }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-card border-r border-border p-3 overflow-y-auto">
      {/* Target Audience Section */}
      {onListChange && (
        <div className="mb-4">
          <h4 className="font-medium text-sm mb-2 text-muted-foreground">Target Audience</h4>
          <Select value={selectedList?.id || ''} onValueChange={onListChange}>
            <SelectTrigger className="w-full h-8 text-xs focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Select list" className="truncate" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background">
              {allLists.map((list) => (
                <SelectItem key={list.id} value={list.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className={`w-2 h-2 rounded-full ${
                        list.isLive ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="text-xs truncate">{list.name}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {list.jobCount}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="mb-4">
        <h4 className="font-medium text-sm text-muted-foreground">Actions <span className="text-xs font-normal opacity-60">• Drag to canvas</span></h4>
      </div>
      
      <div className="space-y-3">
        {nodeCategories.map((category) => (
          <div key={category.title}>
            <div className="space-y-1">
              {category.nodes.map((node) => {
                const Icon = iconMap[node.icon as keyof typeof iconMap];
                return (
                  <Card
                    key={node.type}
                    className="p-2 cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-200 border hover:border-primary/20"
                    draggable
                    onDragStart={(event) => onDragStart(event, node.type)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md bg-gradient-to-br ${node.color} text-white`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs">{node.label}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {node.description}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {onLoadTemplate && (
        <>
          <Separator className="my-3" />
          <SuggestedWorkflows onLoadTemplate={onLoadTemplate} />
        </>
      )}

    </div>
  );
};

export default NodePalette;