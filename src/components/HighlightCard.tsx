import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Trash2, Check, X } from "lucide-react";

interface Highlight {
  id: string;
  text: string;
}

interface HighlightCardProps {
  highlight: Highlight;
  isEditing: boolean;
  onEdit: (highlightId: string, newText: string) => void;
  onDelete: (highlightId: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
}

export const HighlightCard = ({
  highlight,
  isEditing,
  onEdit,
  onDelete,
  onStartEdit,
  onCancelEdit,
}: HighlightCardProps) => {
  const [editingContent, setEditingContent] = useState(highlight.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset editing content when switching highlights or starting edit
  useEffect(() => {
    if (isEditing) {
      setEditingContent(highlight.text);
    }
  }, [isEditing, highlight.text]);

  // Auto-resize and focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);

      // Auto-resize
      textarea.style.height = "auto";
      textarea.style.height = Math.max(60, textarea.scrollHeight) + "px";
    }
  }, [isEditing, editingContent]);

  const handleSave = () => {
    if (editingContent.trim()) {
      onEdit(highlight.id, editingContent.trim());
    } else {
      onCancelEdit();
    }
  };

  const handleCancel = () => {
    setEditingContent(highlight.text);
    onCancelEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleClick = () => {
    if (!isEditing) {
      onStartEdit();
    }
  };

  return (
    <div className="relative group border rounded-lg p-3 transition-colors border-border hover:border-primary/20 hover:bg-muted/30">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                ref={textareaRef}
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[60px] w-full resize-none border-primary/40 focus:border-primary"
                placeholder="Enter job highlight..."
              />
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSave}
                  size="sm"
                  disabled={!editingContent.trim()}
                  className="h-7 px-2"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  className="h-7 px-2"
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="text-sm leading-relaxed cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
              onClick={handleClick}
              title="Click to edit"
            >
              {highlight.text}
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              onClick={onStartEdit}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              title="Edit highlight"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              onClick={() => onDelete(highlight.id)}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              title="Delete highlight"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};