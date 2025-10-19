import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { GitBranch, X, UserPlus, Eye, MessageSquare, Heart, Send, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

// Icon mapping
const iconMap = {
  GitBranch,
  UserPlus,
  Eye, 
  MessageSquare,
  Heart,
  Send,
  Clock,
};

interface DecisionNodeProps {
  id: string;
  data: {
    label: string;
    description?: string;
    color?: string;
    icon?: string;
    originalType?: string;
  };
}

const DecisionNode: React.FC<DecisionNodeProps> = ({ id, data }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { deleteElements } = useReactFlow();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  // Use dynamic colors or fallback to defaults
  const gradientColor = data.color || 'from-purple-400 to-violet-500';
  const borderColor = data.color ? 
    `border-${data.color.split('-')[1]}-200` : 'border-purple-200';
  const bgColor = data.color ? 
    `from-${data.color.split('-')[1]}-50 to-${data.color.split('-')[2]?.split('-')[0] || 'violet'}-50` : 
    'from-purple-50 to-violet-50';
  const handleColor = data.color ? 
    `!bg-${data.color.split('-')[1]}-500` : '!bg-purple-500';

  const IconComponent = (data.icon && iconMap[data.icon as keyof typeof iconMap]) || GitBranch;

  return (
    <Card 
      className={`min-w-[200px] border-2 ${borderColor} bg-gradient-to-br ${bgColor} hover:shadow-lg transition-all duration-200 relative`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <button
          onClick={handleDelete}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs z-10 shadow-lg transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      <Handle
        type="target"
        position={Position.Top}
        className={`w-3 h-3 ${handleColor} !border-2 !border-white shadow-lg`}
      />
      
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${gradientColor} text-white`}>
            <IconComponent className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm text-foreground">{data.label}</div>
            {data.description && (
              <div className="text-xs text-muted-foreground">{data.description}</div>
            )}
          </div>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        className="w-3 h-3 !bg-green-500 !border-2 !border-white shadow-lg !left-[25%]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        className="w-3 h-3 !bg-red-500 !border-2 !border-white shadow-lg !left-[75%]"
      />
    </Card>
  );
};

export default DecisionNode;