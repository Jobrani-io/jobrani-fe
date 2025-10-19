import React, { useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  ReactFlowProvider,
  Panel,
} from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import TriggerNode from './workflow/nodes/TriggerNode';
import EnhancedActionNode from './workflow/nodes/EnhancedActionNode';
import DecisionNode from './workflow/nodes/DecisionNode';
import '@xyflow/react/dist/style.css';

const nodeTypes = {
  trigger: TriggerNode,
  enhanced: EnhancedActionNode,
  decision: DecisionNode,
};

interface WorkflowTemplate {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  prospects: string[];
}

const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'job-application-outreach',
    name: 'Job Application Outreach',
    prospects: ['Senior Software Engineer at Meta', 'Product Manager at Google', 'Engineering Lead at Stripe'],
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 200, y: 110 },
        data: { label: 'Campaign Start', description: 'Begin automation sequence' },
      },
      {
        id: '2',
        type: 'enhanced',
        position: { x: 200, y: 230 },
        data: {
          label: 'Apply to Job',
          description: 'Submit job application',
          color: 'from-blue-400 to-indigo-500',
          icon: 'FileText',
          originalType: 'apply-job',
        },
      },
      {
        id: '3',
        type: 'enhanced',
        position: { x: 200, y: 350 },
        data: {
          label: 'Send Connection',
          description: 'Connect on LinkedIn',
          color: 'from-green-400 to-emerald-500',
          icon: 'UserPlus',
          originalType: 'connection-request',
          execHiringManagerEnabled: true,
          peerEnabled: true,
          recruiterEnabled: true,
          noResponseEnabled: true,
          waitPeriod: '7 days',
        },
      },
      {
        id: '5',
        type: 'enhanced',
        position: { x: 50, y: 530 },
        data: {
          label: 'Notify Me',
          description: 'Alert on reply received',
          color: 'from-yellow-400 to-orange-500',
          icon: 'Bell',
          originalType: 'notify',
        },
      },
      {
        id: '6',
        type: 'enhanced',
        position: { x: 350, y: 530 },
        data: {
          label: 'Send Message',
          description: 'LinkedIn message or InMail',
          color: 'from-indigo-400 to-purple-500',
          icon: 'Mail',
          originalType: 'send-message',
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'default' },
      { id: 'e2-3', source: '2', target: '3', type: 'default' },
      { id: 'e3-5', source: '3', target: '5', sourceHandle: 'reply', type: 'default' },
      { id: 'e3-6', source: '3', target: '6', sourceHandle: 'no-reply', type: 'default' },
    ],
  },
];

const LiveWorkflowDemoInner: React.FC = () => {
  const [currentProspectIndex, setCurrentProspectIndex] = useState(0);
  const [activeNodeId, setActiveNodeId] = useState<string | null>('1');

  const currentTemplate = workflowTemplates[0]; // Only show the job application workflow
  const currentProspect = currentTemplate.prospects[currentProspectIndex];

  // Cycle through prospects every 3 seconds within the same template
  useEffect(() => {
    const prospectInterval = setInterval(() => {
      setCurrentProspectIndex((prev) => (prev + 1) % currentTemplate.prospects.length);
    }, 3000);

    return () => clearInterval(prospectInterval);
  }, [currentTemplate.prospects.length]);

  // Simulate workflow progress
  useEffect(() => {
    const progressInterval = setInterval(() => {
      const nodeIds = currentTemplate.nodes.map(node => node.id);
      setActiveNodeId((prevId) => {
        if (!prevId) return nodeIds[0];
        const currentIndex = nodeIds.indexOf(prevId);
        const nextIndex = (currentIndex + 1) % nodeIds.length;
        return nodeIds[nextIndex];
      });
    }, 2000);

    return () => clearInterval(progressInterval);
  }, [currentTemplate]);

  // Add pulse animation to active nodes
  const nodesWithStatus = currentTemplate.nodes.map(node => ({
    ...node,
    className: `${node.id === activeNodeId ? 'animate-pulse ring-2 ring-primary/50' : ''}`
  }));

  return (
    <div className="space-y-2">
      {/* Template Name and Prospect Info - Above Canvas */}
      <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg p-2">
        <div className="text-xs space-y-0.5">
          <div className="font-medium text-foreground">{currentTemplate.name}</div>
          <div className="text-muted-foreground truncate">Processing: {currentProspect}</div>
        </div>
      </div>

      {/* Workflow Canvas */}
      <div className="relative w-full h-[400px] bg-gradient-to-br from-background to-muted/30 border border-border rounded-lg overflow-hidden">
        <ReactFlow
          nodes={nodesWithStatus}
          edges={currentTemplate.edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          panOnScroll={false}
          panOnDrag={false}
          attributionPosition="bottom-right"
          className="workflow-demo"
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1}
            className="opacity-30"
          />
        </ReactFlow>
      </div>
    </div>
  );
};

const LiveWorkflowDemo: React.FC = () => {
  return (
    <ReactFlowProvider>
      <LiveWorkflowDemoInner />
    </ReactFlowProvider>
  );
};

export default LiveWorkflowDemo;