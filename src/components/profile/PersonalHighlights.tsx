import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Plus, Edit2, Trash2, Save, X, FileText, Award, Briefcase, User } from 'lucide-react';
import { ProfileData, PersonalHighlight } from '@/types/profileData';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface PersonalHighlightsProps {
  profileData: ProfileData;
  onProfileUpdate: (data: Partial<ProfileData>) => void;
}

interface SortableHighlightItemProps {
  highlight: PersonalHighlight;
  isEditing: boolean;
  editText: string;
  editCategory: PersonalHighlight['category'];
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onTextChange: (text: string) => void;
  onCategoryChange: (category: PersonalHighlight['category']) => void;
}

const SortableHighlightItem: React.FC<SortableHighlightItemProps> = ({
  highlight,
  isEditing,
  editText,
  editCategory,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onTextChange,
  onCategoryChange,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: highlight.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getCategoryIcon = (category: PersonalHighlight['category']) => {
    switch (category) {
      case 'achievement': return Award;
      case 'skill': return Sparkles;
      case 'experience': return Briefcase;
      default: return User;
    }
  };

  const getCategoryColor = (category: PersonalHighlight['category']) => {
    switch (category) {
      case 'achievement': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'skill': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'experience': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const CategoryIcon = getCategoryIcon(highlight.category);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow"
    >
      {isEditing ? (
        <div className="space-y-3">
          <div>
            <Label htmlFor="edit-category">Category</Label>
            <Select value={editCategory} onValueChange={(value) => onCategoryChange(value as PersonalHighlight['category'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="achievement">🏆 Achievement</SelectItem>
                <SelectItem value="skill">✨ Skill</SelectItem>
                <SelectItem value="experience">💼 Experience</SelectItem>
                <SelectItem value="custom">👤 Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="edit-text">Highlight</Label>
            <Textarea
              id="edit-text"
              value={editText}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Describe your highlight..."
              className="min-h-[80px]"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={onSave}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing text-muted-foreground mt-1"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          
          <div className={`p-2 rounded-lg ${getCategoryColor(highlight.category)} flex-shrink-0`}>
            <CategoryIcon className="h-4 w-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-relaxed">{highlight.text}</p>
            {highlight.isFromResume && (
              <Badge variant="outline" className="mt-2 text-xs">
                <FileText className="h-3 w-3 mr-1" />
                From Resume
              </Badge>
            )}
          </div>
          
          <div className="flex gap-1 flex-shrink-0">
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const PersonalHighlights: React.FC<PersonalHighlightsProps> = ({
  profileData,
  onProfileUpdate,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editCategory, setEditCategory] = useState<PersonalHighlight['category']>('custom');
  const [newHighlightText, setNewHighlightText] = useState('');
  const [newHighlightCategory, setNewHighlightCategory] = useState<PersonalHighlight['category']>('custom');

  const handleEdit = (highlight: PersonalHighlight) => {
    setEditingId(highlight.id);
    setEditText(highlight.text);
    setEditCategory(highlight.category);
  };

  const handleSave = () => {
    if (editingId && editText.trim()) {
      const updatedHighlights = profileData.personalHighlights.map(h =>
        h.id === editingId
          ? { ...h, text: editText.trim(), category: editCategory }
          : h
      );
      onProfileUpdate({ personalHighlights: updatedHighlights });
      setEditingId(null);
      setEditText('');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = (highlightId: string) => {
    const updatedHighlights = profileData.personalHighlights.filter(h => h.id !== highlightId);
    onProfileUpdate({ personalHighlights: updatedHighlights });
  };

  const handleAdd = () => {
    if (newHighlightText.trim()) {
      const newHighlight: PersonalHighlight = {
        id: `highlight_${Date.now()}`,
        text: newHighlightText.trim(),
        category: newHighlightCategory,
        isFromResume: false,
        order: profileData.personalHighlights.length,
      };
      onProfileUpdate({
        personalHighlights: [...profileData.personalHighlights, newHighlight]
      });
      setNewHighlightText('');
      setNewHighlightCategory('custom');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = profileData.personalHighlights.findIndex(h => h.id === active.id);
    const newIndex = profileData.personalHighlights.findIndex(h => h.id === over.id);
    
    const reorderedHighlights = [...profileData.personalHighlights];
    const [movedItem] = reorderedHighlights.splice(oldIndex, 1);
    reorderedHighlights.splice(newIndex, 0, movedItem);
    
    // Update order values
    const updatedHighlights = reorderedHighlights.map((highlight, index) => ({
      ...highlight,
      order: index,
    }));
    
    onProfileUpdate({ personalHighlights: updatedHighlights });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Personal Highlights
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Key achievements, skills, and experiences that make you stand out. These will be used in your personalized outreach messages.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Highlight */}
        <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
          <div>
            <Label htmlFor="new-category">Category</Label>
            <Select value={newHighlightCategory} onValueChange={(value) => setNewHighlightCategory(value as PersonalHighlight['category'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="achievement">🏆 Achievement</SelectItem>
                <SelectItem value="skill">✨ Skill</SelectItem>
                <SelectItem value="experience">💼 Experience</SelectItem>
                <SelectItem value="custom">👤 Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="new-highlight">New Highlight</Label>
            <Textarea
              id="new-highlight"
              value={newHighlightText}
              onChange={(e) => setNewHighlightText(e.target.value)}
              placeholder="e.g., Led a team of 5 engineers to deliver a customer-facing feature that increased retention by 20%"
              className="min-h-[80px]"
            />
          </div>
          <Button onClick={handleAdd} disabled={!newHighlightText.trim()}>
            <Plus className="h-4 w-4 mr-1" />
            Add Highlight
          </Button>
        </div>

        {/* Existing Highlights */}
        {profileData.personalHighlights.length > 0 ? (
          <DndContext 
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={profileData.personalHighlights.map(h => h.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {profileData.personalHighlights.map((highlight) => (
                  <SortableHighlightItem
                    key={highlight.id}
                    highlight={highlight}
                    isEditing={editingId === highlight.id}
                    editText={editText}
                    editCategory={editCategory}
                    onEdit={() => handleEdit(highlight)}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onDelete={() => handleDelete(highlight.id)}
                    onTextChange={setEditText}
                    onCategoryChange={setEditCategory}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No highlights yet. Upload your resume or add them manually above.</p>
          </div>
        )}

        {profileData.personalHighlights.length > 0 && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Drag to reorder • These highlights will be available as tokens in your outreach messages
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalHighlights;
