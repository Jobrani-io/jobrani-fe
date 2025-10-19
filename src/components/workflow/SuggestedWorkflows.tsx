import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MessageCircle, Target, ChevronLeft, ChevronRight } from 'lucide-react';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  steps: string[];
  nodes: any[];
  edges: any[];
}

const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'quick-apply-connect',
    name: 'Quick Apply & Connect',
    description: 'Apply to job, send connection, and follow up with LinkedIn message',
    icon: Target,
    steps: ['Start Campaign', 'Apply to Job', 'Send Connection (Exec)', 'If No Reply: Follow Up Message'],
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 250, y: 25 },
        data: { label: 'Start Campaign', description: 'Begin job application sequence' },
      },
        {
          id: '2',
          type: 'enhanced',
          position: { x: 250, y: 120 },
          data: {
            label: 'Apply to Job',
            description: 'Submit application',
            color: 'from-blue-400 to-blue-600',
            icon: 'FileText',
            originalType: 'apply-job',
          },
        },
        {
          id: '3',
          type: 'enhanced',
          position: { x: 250, y: 220 },
          data: {
            label: 'Send Connection',
            description: 'Exec, 1 Day, Split if Replied',
            color: 'from-green-400 to-green-600',
            icon: 'UserPlus',
            originalType: 'connection-request',
            waitEnabled: true,
            waitPeriod: '1 day',
            noResponseEnabled: true,
            execHiringManagerEnabled: true,
            recruiterEnabled: false,
            peerEnabled: false,
          },
        },
        {
          id: '4',
          type: 'enhanced',
          position: { x: 150, y: 380 },
          data: {
            label: 'Notify Me',
            description: 'Connection accepted',
            color: 'from-emerald-400 to-emerald-600',
            icon: 'Bell',
            originalType: 'notify',
          },
        },
        {
          id: '5',
          type: 'enhanced',
          position: { x: 350, y: 380 },
          data: {
            label: 'Follow Up LinkedIn Message',
            description: 'Send follow-up message',
            color: 'from-purple-400 to-purple-600',
            icon: 'MessageSquare',
            originalType: 'send-message',
            waitEnabled: true,
            waitPeriod: '7 days',
          },
        },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'default' },
      { id: 'e2-3', source: '2', target: '3', type: 'default' },
        { id: 'e3-4', source: '3', target: '4', sourceHandle: 'reply', type: 'default' },
        { id: 'e3-5', source: '3', target: '5', sourceHandle: 'no-reply', type: 'default' },
    ],
  },
  {
    id: 'multi-touch-outreach',
    name: 'Multi-Touch Outreach',
    description: 'Apply and connect with multiple contacts, follow up if no reply',
    icon: Users,
    steps: ['Start Campaign', 'Apply to Job', 'Send Connection (Exec, Recruiter, Peer)', 'If No Reply: Follow Up Message'],
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 250, y: 25 },
        data: { label: 'Start Campaign', description: 'Begin multi-touch sequence' },
      },
        {
          id: '2',
          type: 'enhanced',
          position: { x: 250, y: 120 },
          data: {
            label: 'Apply to Job',
            description: 'Submit application',
            color: 'from-blue-400 to-blue-600',
            icon: 'FileText',
            originalType: 'apply-job',
          },
        },
        {
          id: '3',
          type: 'enhanced',
          position: { x: 250, y: 220 },
          data: {
            label: 'Send Connection',
            description: 'Exec, Recruiter, Peer, 1 Day, Split if Replied',
            color: 'from-green-400 to-green-600',
            icon: 'UserPlus',
            originalType: 'connection-request',
            waitEnabled: true,
            waitPeriod: '1 day',
            noResponseEnabled: true,
            execHiringManagerEnabled: true,
            recruiterEnabled: true,
            peerEnabled: true,
          },
        },
        {
          id: '4',
          type: 'enhanced',
          position: { x: 150, y: 380 },
          data: {
            label: 'Notify Me',
            description: 'Connection accepted',
            color: 'from-emerald-400 to-emerald-600',
            icon: 'Bell',
            originalType: 'notify',
          },
        },
        {
          id: '5',
          type: 'enhanced',
          position: { x: 350, y: 380 },
          data: {
            label: 'Follow Up with LinkedIn Message',
            description: 'Send follow-up message',
            color: 'from-purple-400 to-purple-600',
            icon: 'MessageSquare',
            originalType: 'send-message',
            waitEnabled: true,
            waitPeriod: '7 days',
          },
        },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'default' },
      { id: 'e2-3', source: '2', target: '3', type: 'default' },
        { id: 'e3-4', source: '3', target: '4', sourceHandle: 'reply', type: 'default' },
        { id: 'e3-5', source: '3', target: '5', sourceHandle: 'no-reply', type: 'default' },
    ],
  },
  {
    id: 'warm-network-build',
    name: 'Warm Network Build',
    description: 'Build relationships by connecting with executives and peers',
    icon: MessageCircle,
    steps: ['Start Campaign', 'Send Connection (Exec, Peer)', '1 Day Wait'],
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 250, y: 25 },
        data: { label: 'Start Campaign', description: 'Begin relationship building' },
      },
        {
          id: '2',
          type: 'enhanced',
          position: { x: 250, y: 120 },
          data: {
            label: 'Send Connection',
            description: 'Exec, Peer, 1 Day',
            color: 'from-green-400 to-green-600',
            icon: 'UserPlus',
            originalType: 'connection-request',
            waitEnabled: true,
            waitPeriod: '1 day',
            execHiringManagerEnabled: true,
            recruiterEnabled: false,
            peerEnabled: true,
          },
        },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'default' },
    ],
  },
];

interface SuggestedWorkflowsProps {
  onLoadTemplate?: (template: WorkflowTemplate) => void;
}

const SuggestedWorkflows: React.FC<SuggestedWorkflowsProps> = ({ onLoadTemplate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance carousel every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === workflowTemplates.length - 1 ? 0 : prevIndex + 1
      );
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const nextTemplate = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === workflowTemplates.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTemplate = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? workflowTemplates.length - 1 : prevIndex - 1
    );
  };

  const currentTemplate = workflowTemplates[currentIndex];
  const Icon = currentTemplate.icon;

  const onDragStart = (event: React.DragEvent, template: WorkflowTemplate) => {
    event.dataTransfer.setData('application/reactflow-template', JSON.stringify(template));
    event.dataTransfer.effectAllowed = 'copy';
  };

  return (
      <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm text-muted-foreground">🚀 Quick Start Templates</h4>
        <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={prevTemplate}
            className="h-6 w-6 p-0"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextTemplate}
            className="h-6 w-6 p-0"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <Card 
        className="p-3 cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 animate-fade-in"
        draggable
        onDragStart={(event) => onDragStart(event, currentTemplate)}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="h-4 w-4 text-primary" />
            <div className="font-medium text-sm">{currentTemplate.name}</div>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {currentTemplate.steps.map((step, index) => (
              <span
                key={index}
                className="text-xs bg-muted px-2 py-1 rounded"
              >
                {step}
              </span>
            ))}
          </div>
        </div>
      </Card>

    </div>
  );
};

export default SuggestedWorkflows;