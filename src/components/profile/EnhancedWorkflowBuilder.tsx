import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ActionType, ProfileData } from "@/types/profileData";
import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FileText, GripVertical, Mail, Target, UserPlus } from "lucide-react";
import React from "react";

interface EnhancedWorkflowBuilderProps {
  profileData: ProfileData;
  selectedActions: ActionType[];
  useCustomOrder: boolean;
  actionOrder: ActionType[];
  mentionJobDirectly: boolean;
  onActionsChange: (actions: ActionType[]) => void;
  onUseCustomOrderChange: (useCustom: boolean) => void;
  onActionOrderChange: (order: ActionType[]) => void;
  onMentionJobDirectlyChange: (mention: boolean) => void;
  onProfileUpdate: (data: Partial<ProfileData>) => void;
}

interface Action {
  id: ActionType;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
}

const actions: Action[] = [
  {
    id: "connect",
    label: "Send LinkedIn Connection",
    description: "Connect with hiring managers and key contacts",
    icon: UserPlus,
  },
  {
    id: "apply",
    label: "Apply for the Job",
    description: "Submit your application to the position",
    icon: FileText,
  },
  {
    id: "email",
    label: "Send Email to Hiring Manager",
    description: "Send personalized email outreach",
    icon: Mail,
  },
];

const UnifiedActionItem: React.FC<{
  action: Action;
  isSelected: boolean;
  orderIndex: number | null;
  canDrag: boolean;
  onToggle: () => void;
}> = ({ action, isSelected, orderIndex, canDrag, onToggle }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: action.id,
    disabled: !canDrag,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = action.icon;

  return (
    <div
      ref={canDrag ? setNodeRef : undefined}
      style={canDrag ? style : undefined}
      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all hover:bg-accent/50 ${
        isSelected
          ? "bg-primary/5 border-primary"
          : "opacity-60 hover:opacity-80"
      }`}
      onClick={onToggle}
    >
      <Checkbox
        checked={isSelected}
        onChange={() => {
          console.log("onChange", isSelected);
        }}
        className="pointer-events-none"
      />

      <div className="p-1.5 rounded bg-primary/10">
        <Icon
          className={`h-4 w-4 ${
            isSelected ? "text-primary" : "text-muted-foreground"
          }`}
        />
      </div>

      <div className="flex-1">
        <div
          className={`font-medium text-sm ${
            isSelected ? "" : "text-muted-foreground"
          }`}
        >
          {action.label}
        </div>
        <div className="text-xs text-muted-foreground">
          {action.description}
        </div>
      </div>

      {isSelected && orderIndex !== null && (
        <Badge variant="secondary" className="text-xs">
          {orderIndex + 1}
        </Badge>
      )}

      {canDrag && isSelected && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:cursor-grabbing text-muted-foreground ml-2"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}
    </div>
  );
};

const EnhancedWorkflowBuilder: React.FC<EnhancedWorkflowBuilderProps> = ({
  profileData,
  selectedActions,
  useCustomOrder,
  actionOrder,
  mentionJobDirectly,
  onActionsChange,
  onUseCustomOrderChange,
  onActionOrderChange,
  onMentionJobDirectlyChange,
  onProfileUpdate,
}) => {
  const handleActionToggle = (actionId: ActionType) => {
    const isSelected = selectedActions.includes(actionId);
    if (isSelected) {
      onActionsChange(selectedActions.filter((id) => id !== actionId));
    } else {
      onActionsChange([...selectedActions, actionId]);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeIdx = actionOrder.indexOf(active.id as ActionType);
    const overIdx = actionOrder.indexOf(over.id as ActionType);
    const newOrder = arrayMove(actionOrder, activeIdx, overIdx);

    onActionOrderChange(newOrder);
  };

  const getActionOrderIndex = (actionId: ActionType): number | null => {
    if (!selectedActions.includes(actionId)) return null;
    const orderedSelectedActions = actionOrder.filter((id) =>
      selectedActions.includes(id)
    );
    return orderedSelectedActions.indexOf(actionId);
  };

  const canDragActions = selectedActions.length > 1;
  const sortableItems = actionOrder; // Include all actions in sortable context

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Target className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Campaign Strategy</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Map the steps of your outreach — what to send, in what order, and why.
        </p>
      </CardHeader>

      <CardContent>
        <Card className="border-0 shadow-none p-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Your Workflow Actions</CardTitle>
              {selectedActions.length > 1 && (
                <p className="text-xs text-muted-foreground">Drag to reorder</p>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortableItems}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {actions.map((action) => (
                    <UnifiedActionItem
                      key={action.id}
                      action={action}
                      isSelected={selectedActions.includes(action.id)}
                      orderIndex={getActionOrderIndex(action.id)}
                      canDrag={
                        canDragActions && selectedActions.includes(action.id)
                      }
                      onToggle={() => handleActionToggle(action.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {selectedActions.length > 0 && (
              <div className="mt-4 pt-3 border-t space-y-4">
                {/* Message Strategy Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground">
                        Mention specific job role in messages
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {mentionJobDirectly
                          ? "Direct and targeted approach for specific opportunities"
                          : "Broader networking approach for long-term connections"}
                      </p>
                    </div>
                    <Switch
                      checked={mentionJobDirectly}
                      onCheckedChange={onMentionJobDirectlyChange}
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-muted/30 border">
                    <div className="text-xs text-muted-foreground mb-2">
                      <strong>Example message:</strong>
                    </div>
                    <div className="text-sm text-foreground italic">
                      {mentionJobDirectly
                        ? `"Hi [Name], I'm interested in your Software Engineer position at [Company]. Based on my 3+ years of React experience and passion for building scalable web applications, I believe I'd be a great addition to your team..."`
                        : `"Hi [Name], I really admire [Company]'s work in AI and innovation. I'd love to connect and explore opportunities where my software engineering background could contribute to your team's success..."`}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground pt-2 border-t">
                  {selectedActions.length} action
                  {selectedActions.length > 1 ? "s" : ""} selected
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default EnhancedWorkflowBuilder;
