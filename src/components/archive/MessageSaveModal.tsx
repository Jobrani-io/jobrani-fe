import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
  const [type, setType] = useState<SavedMessage['type']>('connection');

  const handleSave = () => {
    if (title.trim()) {
      onSave(title, type);
      setTitle('');
      setType('connection');
      onClose();
    }
  };

  const handleClose = () => {
    setTitle('');
    setType('connection');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Message to Library</DialogTitle>
          <DialogDescription>
            Give your message a title and select its type.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Message Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Cold Outreach - SaaS Companies"
            />
          </div>
          
          <div>
            <Label htmlFor="type">Message Type</Label>
            <Select value={type} onValueChange={(value: SavedMessage['type']) => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="connection">Connection Request</SelectItem>
                <SelectItem value="message">Follow-up Message</SelectItem>
                <SelectItem value="inmail">InMail</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="preview">Message Preview</Label>
            <Textarea
              id="preview"
              value={messageContent}
              readOnly
              className="min-h-[100px] resize-none"
            />
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