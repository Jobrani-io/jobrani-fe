import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProfileData, PersonalHighlight } from '@/types/profileData';
import {
	GripVertical,
	Edit2,
	Trash2,
	Check,
	X,
	Wand2,
	Star,
	FileText,
	Sparkles
} from 'lucide-react';
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedPersonalHighlightsProps {
	profileData: ProfileData;
	onProfileUpdate: (data: Partial<ProfileData>) => void;
}

interface SortableHighlightItemProps {
	highlight: PersonalHighlight;
	isEditing: boolean;
	editingText: string;
	onStartEdit: () => void;
	onSave: () => void;
	onCancel: () => void;
	onDelete: () => void;
	onEditTextChange: (text: string) => void;
}

const SortableHighlightItem: React.FC<SortableHighlightItemProps> = ({
	highlight,
	isEditing,
	editingText,
	onStartEdit,
	onSave,
	onCancel,
	onDelete,
	onEditTextChange
}) => {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
		id: highlight.id
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition
	};

	const getCategoryColor = (category: string) => {
		switch (category) {
			case 'achievement':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
			case 'skill':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
			case 'experience':
				return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
		}
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`group flex items-center gap-2 px-3 py-2 rounded-lg bg-card hover:bg-accent/30 transition-all duration-200 border border-border/40 ${
				isEditing ? 'bg-accent/20' : ''
			}`}>
			<button
				className="cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-muted-foreground transition-all duration-200"
				{...attributes}
				{...listeners}>
				<GripVertical className="h-3.5 w-3.5" />
			</button>

			<div className="flex-1 min-w-0">
				{isEditing ? (
					<div
						contentEditable
						suppressContentEditableWarning
						onBlur={(e) => onEditTextChange(e.currentTarget.textContent || '')}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								onSave();
							} else if (e.key === 'Escape') {
								e.preventDefault();
								onCancel();
							}
						}}
						className="text-sm text-foreground leading-relaxed outline-none focus:outline-none"
						style={{ minHeight: '1.25rem' }}>
						{editingText}
					</div>
				) : (
					<p className="text-sm text-foreground leading-relaxed">{highlight.text}</p>
				)}
			</div>

			<div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
				{isEditing ? (
					<>
						<Button size="sm" variant="ghost" onClick={onSave} className="h-7 w-7 p-0">
							<Check className="h-3 w-3 text-green-600" />
						</Button>
						<Button size="sm" variant="ghost" onClick={onCancel} className="h-7 w-7 p-0">
							<X className="h-3 w-3 text-muted-foreground" />
						</Button>
					</>
				) : (
					<>
						<Button size="sm" variant="ghost" onClick={onStartEdit} className="h-7 w-7 p-0">
							<Edit2 className="h-3 w-3 text-muted-foreground/60" />
						</Button>
						<Button size="sm" variant="ghost" onClick={onDelete} className="h-7 w-7 p-0">
							<Trash2 className="h-3 w-3 text-destructive/70" />
						</Button>
					</>
				)}
			</div>
		</div>
	);
};

const EnhancedPersonalHighlights: React.FC<EnhancedPersonalHighlightsProps> = ({
	profileData,
	onProfileUpdate
}) => {
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingText, setEditingText] = useState('');
	const [isAdding, setIsAdding] = useState(false);
	const [newHighlightText, setNewHighlightText] = useState('');
	const [newHighlightCategory, setNewHighlightCategory] = useState('experience');

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates
		})
	);

	const handleEdit = (highlight: PersonalHighlight) => {
		setEditingId(highlight.id);
		setEditingText(highlight.text);
	};

	const handleSave = () => {
		if (editingId && editingText.trim()) {
			const updatedHighlights = profileData.personalHighlights.map((h) =>
				h.id === editingId ? { ...h, text: editingText.trim() } : h
			);
			onProfileUpdate({ personalHighlights: updatedHighlights });
			setEditingId(null);
			setEditingText('');
		}
	};

	const handleCancel = () => {
		setEditingId(null);
		setEditingText('');
	};

	const handleDelete = async (highlightId: string) => {
		const updatedHighlights = profileData.personalHighlights.filter((h) => h.id !== highlightId);
		onProfileUpdate({ personalHighlights: updatedHighlights });

		await supabase
			.from('user_resumes')
			.update({
				highlights: updatedHighlights.map((h) => h.text).join('\n')
			})
			.eq('id', profileData?.resumeId);
	};

	const handleAddHighlight = () => {
		if (newHighlightText.trim()) {
			const newHighlight: PersonalHighlight = {
				id: `highlight_${Date.now()}`,
				text: newHighlightText.trim(),
				category: newHighlightCategory as any,
				isFromResume: false,
				order: profileData.personalHighlights.length
			};

			onProfileUpdate({
				personalHighlights: [...profileData.personalHighlights, newHighlight]
			});

			setNewHighlightText('');
			setNewHighlightCategory('experience');
			setIsAdding(false);
		}
	};

	const handleCancelAdd = () => {
		setIsAdding(false);
		setNewHighlightText('');
		setNewHighlightCategory('experience');
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = profileData.personalHighlights.findIndex((h) => h.id === active.id);
			const newIndex = profileData.personalHighlights.findIndex((h) => h.id === over.id);

			const reorderedHighlights = arrayMove(
				profileData.personalHighlights,
				oldIndex,
				newIndex
			).map((h, index) => ({ ...h, order: index }));

			onProfileUpdate({ personalHighlights: reorderedHighlights });
		}
	};

	const sortedHighlights = [...profileData.personalHighlights].sort((a, b) => a.order - b.order);

	return (
		<div className="space-y-2">
			{/* Existing Highlights */}
			{sortedHighlights.length > 0 ? (
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}>
					<SortableContext
						items={sortedHighlights.map((h) => h.id)}
						strategy={verticalListSortingStrategy}>
						<div className="space-y-1.5">
							{sortedHighlights.map((highlight) => (
								<SortableHighlightItem
									key={highlight.id}
									highlight={highlight}
									isEditing={editingId === highlight.id}
									editingText={editingText}
									onStartEdit={() => handleEdit(highlight)}
									onSave={handleSave}
									onCancel={handleCancel}
									onDelete={() => handleDelete(highlight.id)}
									onEditTextChange={setEditingText}
								/>
							))}
						</div>
					</SortableContext>
				</DndContext>
			) : (
				<div className="text-center py-6 text-muted-foreground">
					<div className="flex items-center justify-center gap-1 mb-2">
						<FileText className="h-6 w-6 opacity-50" />
						<Sparkles className="h-4 w-4 opacity-50" />
					</div>
					<p className="text-sm">No resume highlights yet</p>
					<p className="text-xs">
						Upload a resume above to auto-extract highlights or add them manually
					</p>
				</div>
			)}
		</div>
	);
};

export default EnhancedPersonalHighlights;
