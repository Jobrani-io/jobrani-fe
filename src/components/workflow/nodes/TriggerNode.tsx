import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Zap, X } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface TriggerNodeProps {
  id: string;
  data: {
    label: string;
    description?: string;
  };
}

const TriggerNode: React.FC<TriggerNodeProps> = ({ id, data }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { deleteElements } = useReactFlow();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <Card 
      className="min-w-[200px] border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-all duration-200 relative"
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
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 text-white">
            <Zap className="h-4 w-4" />
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
        className="w-3 h-3 !bg-green-500 !border-2 !border-white shadow-lg"
      />
    </Card>
  );
};

export default TriggerNode;