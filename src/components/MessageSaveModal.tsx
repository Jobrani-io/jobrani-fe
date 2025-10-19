import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SavedMessage } from '@/hooks/useMessageLibrary';

interface MessageSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, type: SavedMessage['type']) => void;
  messageContent: string;
}

const MessageSaveModal: React.FC<MessageSaveModalProps> = ({
  isOpen,
  onClose,
  onSave,
  messageContent
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<SavedMessage['type']>('message');

  const handleSave = () => {
    if (!title.trim()) return;
    
    onSave(title, type);
    setTitle('');
    setType('message');
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setType('message');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Message to Library</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Message Title</Label>
            <Input
              id="title"
              placeholder="e.g., 'Software Engineer Outreach'"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Message Type</Label>
            <Select value={type} onValueChange={(value: SavedMessage['type']) => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="connection">Connection Request</SelectItem>
                <SelectItem value="message">Direct Message</SelectItem>
                <SelectItem value="inmail">InMail</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="p-3 bg-muted rounded-md text-sm max-h-32 overflow-y-auto">
              {messageContent || 'No content to preview'}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!title.trim() || !messageContent.trim()}
          >
            Save Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MessageSaveModal;