import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  Panel,
} from '@xyflow/react';
import { Maximize2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import '@xyflow/react/dist/style.css';

import TriggerNode from './nodes/TriggerNode';
import ActionNode from './nodes/ActionNode';
import DecisionNode from './nodes/DecisionNode';
import DelayNode from './nodes/DelayNode';
import ChannelNode from './nodes/ChannelNode';
import EnhancedActionNode from './nodes/EnhancedActionNode';
import NodePalette from './NodePalette';
import { Campaign } from '@/hooks/useCampaigns';

interface WorkflowCanvasProps {
  onLoadTemplate?: (template: any) => void;
  selectedList?: Campaign | null;
  onListChange?: (listId: string) => void;
  allLists?: Campaign[];
  selectedListId?: string;
  onSaveWorkflow?: () => void;
}

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  decision: DecisionNode,
  delay: DelayNode,
  channel: ChannelNode,
  enhanced: EnhancedActionNode,
  // Map new node types to enhanced components for better UX
  'view-profile': EnhancedActionNode,
  'apply-to-job': EnhancedActionNode,
  'connection-request': EnhancedActionNode,
  'send-message': EnhancedActionNode,
  'notify-me': EnhancedActionNode,
  'wait-period': DelayNode,
  'conditional-branch': DecisionNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'trigger',
    position: { x: 250, y: 25 },
    data: { 
      label: 'Campaign Start',
      description: 'Begin automation sequence'
    },
  },
];

const initialEdges: Edge[] = [];

const WorkflowCanvasInner: React.FC<WorkflowCanvasProps> = ({ 
  onLoadTemplate, 
  selectedList, 
  onListChange, 
  allLists,
  selectedListId,
  onSaveWorkflow 
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  const { screenToFlowPosition, getNode, fitView, zoomIn, zoomOut, getViewport, setViewport } = useReactFlow();

  // Load a suggested workflow template
  const loadWorkflowTemplate = useCallback((template: any) => {
    setNodes(template.nodes);
    setEdges(template.edges);
    if (onLoadTemplate) onLoadTemplate(template);
  }, [setNodes, setEdges, onLoadTemplate]);
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Helper function to calculate distance between two points
  const calculateDistance = (pos1: { x: number; y: number }, pos2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
  };

  // Helper function to find the closest node within connection range
  const findClosestNode = (newPosition: { x: number; y: number }, existingNodes: Node[]) => {
    const CONNECTION_THRESHOLD = 250; // pixels - increased for better auto-connection
    let closestNode = null;
    let closestDistance = Infinity;

    existingNodes.forEach((node) => {
      const distance = calculateDistance(newPosition, node.position);
      if (distance < CONNECTION_THRESHOLD && distance < closestDistance) {
        closestDistance = distance;
        closestNode = node;
      }
    });

    return closestNode;
  };

  // Helper function to calculate optimal spacing for new nodes
  const calculateOptimalPosition = (closestNode: Node | null, dropPosition: { x: number; y: number }, allNodes: Node[]) => {
    if (!closestNode) return dropPosition;
    
    const OPTIMAL_SPACING = 160; // increased spacing for better readability
    const HORIZONTAL_OFFSET = 50; // offset for branching
    
    // Check if this is a branching scenario (reply/no-reply)
    const closestNodeData = closestNode.data;
    const hasSplitLogic = closestNodeData?.noResponseEnabled && 
                        ['send-message', 'connection-request'].includes(closestNodeData?.originalType as string);
    
    let newPosition = {
      x: closestNode.position.x,
      y: closestNode.position.y + OPTIMAL_SPACING,
    };
    
    // For split logic, offset horizontally to avoid collision
    if (hasSplitLogic) {
      // Check if there's already a node connected to the reply handle
      const existingReplyConnection = allNodes.find(node => 
        node.position.x === closestNode.position.x && 
        node.position.y > closestNode.position.y &&
        node.position.y <= closestNode.position.y + OPTIMAL_SPACING + 20
      );
      
      if (existingReplyConnection) {
        newPosition.x += HORIZONTAL_OFFSET;
      }
    }
    
    // Ensure no collision with existing nodes
    while (allNodes.some(node => 
      Math.abs(node.position.x - newPosition.x) < 50 && 
      Math.abs(node.position.y - newPosition.y) < 50
    )) {
      newPosition.y += 30;
    }
    
    return newPosition;
  };

  // Helper function to determine if a node type expects responses
  const isResponseExpectedType = (type: string) => {
    const responseExpectedTypes = ['send-message', 'connection-request'];
    return responseExpectedTypes.includes(type);
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      // Check if it's a template drop first
      const templateData = event.dataTransfer.getData('application/reactflow-template');
      if (templateData) {
        try {
          const template = JSON.parse(templateData);
          setNodes(template.nodes);
          setEdges(template.edges);
          if (onLoadTemplate) onLoadTemplate(template);
          return;
        } catch (error) {
          console.error('Error parsing template data:', error);
          return;
        }
      }

      const dragData = event.dataTransfer.getData('application/reactflow');

      if (typeof dragData === 'undefined' || !dragData) {
        return;
      }

      let type: string;
      let nodeData: any = null;

      try {
        const parsedData = JSON.parse(dragData);
        type = parsedData.type;
        nodeData = parsedData.nodeData;
      } catch {
        // Fallback for old format
        type = dragData;
      }

      // Get the correct position relative to the flow canvas
      const dropPosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Find the closest node for auto-connection and optimal positioning
      const closestNode = findClosestNode(dropPosition, nodes);
      const optimalPosition = calculateOptimalPosition(closestNode, dropPosition, nodes);

      const newNodeId = `${nodes.length + 1}`;
      const newNode: Node = {
        id: newNodeId,
        type: getNodeComponentType(type),
        position: optimalPosition,
        data: {
          label: nodeData?.label || getDefaultLabel(type),
          description: nodeData?.description || getDefaultDescription(type),
          color: nodeData?.color,
          icon: nodeData?.icon,
          originalType: type,
          // Enhanced node defaults to match templated workflows
          waitEnabled: true,
          waitPeriod: '1 day',
          noResponseEnabled: isResponseExpectedType(type),
          noResponseAction: 'send-follow-up',
          messageType: 'message',
          execHiringManagerEnabled: true,
          peerEnabled: false,
          recruiterEnabled: false,
        },
      };

      setNodes((nds) => nds.concat(newNode));

      // Auto-connect to closest node if found
      if (closestNode) {
        let sourceHandle = undefined;
        
        // Check if the closest node has split logic enabled
        const closestNodeData = closestNode.data;
        const hasSplitLogic = closestNodeData?.noResponseEnabled && 
                            ['send-message', 'connection-request'].includes(closestNodeData?.originalType);
        
        if (hasSplitLogic) {
          // Get actual node dimensions from React Flow
          const reactFlowNode = getNode(closestNode.id);
          const nodeWidth = reactFlowNode?.measured?.width || 280; // fallback to min-width
          const nodeHeight = reactFlowNode?.measured?.height || 120; // fallback height
          
          console.log('Node dimensions:', { width: nodeWidth, height: nodeHeight });
          console.log('Node position:', closestNode.position);
          
          // Calculate handle positions based on the actual node dimensions
          // Handles are positioned at 25% and 75% of node width from the left edge
          const nodeLeft = closestNode.position.x;
          const nodeRight = nodeLeft + nodeWidth;
          const nodeBottom = closestNode.position.y + nodeHeight;
          
          const replyHandlePos = {
            x: nodeLeft + (nodeWidth * 0.25),
            y: nodeBottom
          };
          
          const noReplyHandlePos = {
            x: nodeLeft + (nodeWidth * 0.75),
            y: nodeBottom
          };
          
          // Calculate distances to both handles from the drop position
          const distanceToReply = calculateDistance(dropPosition, replyHandlePos);
          const distanceToNoReply = calculateDistance(dropPosition, noReplyHandlePos);
          
          console.log('=== HANDLE CONNECTION DEBUG ===');
          console.log('Drop position:', dropPosition);
          console.log('Node bounds:', { left: nodeLeft, right: nodeRight, bottom: nodeBottom });
          console.log('Reply handle pos:', replyHandlePos, 'Distance:', distanceToReply.toFixed(2));
          console.log('No-reply handle pos:', noReplyHandlePos, 'Distance:', distanceToNoReply.toFixed(2));
          console.log('Closest handle:', distanceToReply < distanceToNoReply ? 'reply' : 'no-reply');
          console.log('================================');
          
          // Connect to the closer handle
          sourceHandle = distanceToReply < distanceToNoReply ? 'reply' : 'no-reply';
        }

        const newEdge = {
          id: `e${closestNode.id}-${newNodeId}`,
          source: closestNode.id,
          target: newNodeId,
          sourceHandle,
          type: 'default',
        };
        setEdges((eds) => eds.concat(newEdge));
      }

      // Auto-fit view after adding node with slight delay for smooth transition
      setTimeout(() => {
        fitView({ 
          padding: { top: 0.1, right: 0.3, bottom: 0.1, left: 0.1 }, // Account for minimap
          duration: 800,
          minZoom: 0.4,
          maxZoom: 1.2 
        });
      }, 100);
    },
    [nodes, setNodes, setEdges, screenToFlowPosition, onLoadTemplate, fitView],
  );

  const getNodeComponentType = (type: string) => {
    const nodeTypeMap: { [key: string]: string } = {
      'view-profile': 'enhanced',
      'apply-to-job': 'enhanced',
      'connection-request': 'enhanced',
      'send-message': 'enhanced',
      'notify-me': 'enhanced',
      'wait-period': 'delay',
      'conditional-branch': 'decision',
    };
    return nodeTypeMap[type] || type;
  };

  const getDefaultLabel = (type: string) => {
    switch (type) {
      case 'trigger': return 'Campaign Start';
      case 'view-profile': return 'View Profile';
      case 'apply-to-job': return 'Apply to Job';
      case 'connection-request': return 'Send Connection';
      case 'send-message': return 'Send Message';
      case 'notify-me': return 'Notify Me';
      case 'wait-period': return 'Wait Period';
      case 'conditional-branch': return 'If No Response, Then...';
      // Legacy fallbacks
      case 'action': return 'Send Message';
      case 'decision': return 'Response Check';
      case 'delay': return 'Wait 2 Days';
      case 'channel': return 'LinkedIn';
      default: return 'New Node';
    }
  };

  const getDefaultDescription = (type: string) => {
    switch (type) {
      case 'trigger': return 'Begin automation sequence';
      case 'view-profile': return 'Visit prospect\'s LinkedIn profile';
      case 'apply-to-job': return 'Submit job application';
      case 'connection-request': return 'Connect with prospect on LinkedIn';
      case 'send-message': return 'Send LinkedIn message or InMail';
      case 'notify-me': return 'Get notified when this step is triggered';
      case 'wait-period': return 'Delay before next action';
      case 'conditional-branch': return 'Branch workflow based on response';
      // Legacy fallbacks
      case 'action': return 'Send personalized message';
      case 'decision': return 'Check for response';
      case 'delay': return 'Wait before next action';
      case 'channel': return 'Communication channel';
      default: return '';
    }
  };

  // Auto-layout algorithm to organize all nodes
  const organizeLayout = useCallback(() => {
    const ROOT_X = 250;
    const ROOT_Y = 50;
    const LEVEL_HEIGHT = 160;
    const NODE_WIDTH = 200;
    
    // Create a hierarchy map
    const hierarchy: { [key: string]: { level: number; siblings: string[]; index: number } } = {};
    const processed = new Set<string>();
    
    // Find root nodes (nodes with no incoming edges)
    const rootNodes = nodes.filter(node => 
      !edges.some(edge => edge.target === node.id)
    );
    
    // BFS to assign levels
    const queue = rootNodes.map(node => ({ id: node.id, level: 0 }));
    
    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      
      if (processed.has(id)) continue;
      processed.add(id);
      
      // Find siblings at this level
      const siblingsAtLevel = queue.filter(item => item.level === level).map(item => item.id);
      if (!hierarchy[id]) {
        hierarchy[id] = { level, siblings: siblingsAtLevel, index: siblingsAtLevel.length };
      }
      
      // Add children to queue
      const children = edges.filter(edge => edge.source === id);
      children.forEach(edge => {
        if (!processed.has(edge.target)) {
          queue.push({ id: edge.target, level: level + 1 });
        }
      });
    }
    
    // Calculate positions
    const newNodes = nodes.map(node => {
      const nodeHierarchy = hierarchy[node.id];
      if (!nodeHierarchy) return node;
      
      const { level, siblings, index } = nodeHierarchy;
      const siblingsCount = siblings.length + 1;
      
      // Center siblings horizontally
      const totalWidth = siblingsCount * NODE_WIDTH;
      const startX = ROOT_X - (totalWidth / 2);
      
      return {
        ...node,
        position: {
          x: startX + (index * NODE_WIDTH),
          y: ROOT_Y + (level * LEVEL_HEIGHT)
        }
      };
    });
    
    setNodes(newNodes);
    
    // Fit view after layout
    setTimeout(() => {
      fitView({ 
        padding: { top: 0.2, right: 0.4, bottom: 0.2, left: 0.2 }, // Extra padding for minimap
        duration: 1000,
        minZoom: 0.3,
        maxZoom: 1.0 
      });
    }, 100);
  }, [nodes, edges, setNodes, fitView]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'f' || event.key === 'F') {
        event.preventDefault();
        fitView({ 
          padding: { top: 0.1, right: 0.3, bottom: 0.1, left: 0.1 }, 
          duration: 800 
        });
      }
      if (event.key === 'o' || event.key === 'O') {
        event.preventDefault();
        organizeLayout();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fitView, organizeLayout]);


  return (
    <div className="flex h-full bg-background rounded-lg border overflow-hidden">
      <NodePalette 
        onLoadTemplate={onLoadTemplate ? loadWorkflowTemplate : undefined}
        selectedList={selectedList}
        onListChange={onListChange}
        allLists={allLists}
      />
      
      <div className="flex-1" style={{ height: 'calc(100vh - 200px)' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            defaultViewport={{ x: -50, y: 50, zoom: 0.8 }}
            zoomOnScroll={true}
            zoomOnDoubleClick={true}
            fitViewOptions={{ 
              padding: 0.2,
              minZoom: 0.3,
              maxZoom: 1.5
            }}
            className="bg-gradient-subtle"
          >
            <Controls className="controls-custom" />
            <MiniMap 
              className="minimap-custom"
              nodeStrokeColor="#374151"
              nodeColor="#f3f4f6"
              nodeBorderRadius={8}
            />
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={1}
              color="hsl(var(--muted-foreground) / 0.2)"
            />
            
            {/* Save Controls */}
            <Panel position="top-right" className="flex gap-2 z-10">
              <Button 
                variant="default" 
                size="sm"
                onClick={onSaveWorkflow}
                disabled={!selectedListId}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              >
                <Save className="h-4 w-4 mr-1" />
                Save Workflow
              </Button>
            </Panel>
          </ReactFlow>
      </div>
    </div>
  );
};

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
};

export default WorkflowCanvas;