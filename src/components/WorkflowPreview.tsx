import React from 'react';
import {
  ReactFlow,
  Background,
  Node,
  Edge,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import TriggerNode from './workflow/nodes/TriggerNode';
import EnhancedActionNode from './workflow/nodes/EnhancedActionNode';
import DecisionNode from './workflow/nodes/DecisionNode';

const nodeTypes = {
  trigger: TriggerNode,
  enhanced: EnhancedActionNode,
  decision: DecisionNode,
};

interface WorkflowPreviewProps {
  nodes: Node[];
  edges: Edge[];
  className?: string;
}

const WorkflowPreviewInner: React.FC<WorkflowPreviewProps> = ({ 
  nodes, 
  edges, 
  className = "" 
}) => {
  return (
    <div className={`h-full w-full ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.1,
          minZoom: 0.4,
          maxZoom: 0.8
        }}
        attributionPosition="bottom-right"
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        style={{ backgroundColor: "hsl(var(--background))" }}
      >
        <Background gap={20} size={1} color="hsl(var(--border))" />
      </ReactFlow>
    </div>
  );
};

const WorkflowPreview: React.FC<WorkflowPreviewProps> = (props) => {
  return (
    <ReactFlowProvider>
      <WorkflowPreviewInner {...props} />
    </ReactFlowProvider>
  );
};

export default WorkflowPreview;