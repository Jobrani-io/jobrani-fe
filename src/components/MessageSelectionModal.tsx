import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, MessageSquare, UserPlus, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SavedMessage, useMessageLibrary } from '@/hooks/useMessageLibrary';

interface MessageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (message: SavedMessage) => void;
  onCreateNew?: () => void;
  actionType: 'send-message' | 'connection-request';
  messageType?: 'message' | 'inmail';
}

const MessageSelectionModal: React.FC<MessageSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  onCreateNew,
  actionType,
  messageType = 'message'
}) => {
  const { messages } = useMessageLibrary();
  const [selectedMessageId, setSelectedMessageId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter messages based on action type and message type
  const filteredMessages = messages.filter(msg => {
    const typeMatch = actionType === 'connection-request' ? 
      msg.type === 'connection' : 
      (messageType === 'inmail' ? msg.type === 'inmail' : msg.type === 'message');
    
    const searchMatch = !searchTerm || 
      msg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    return typeMatch && searchMatch;
  });

  const handleSelect = () => {
    const selectedMessage = messages.find(msg => msg.id === selectedMessageId);
    if (selectedMessage) {
      onSelect(selectedMessage);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedMessageId('');
    setSearchTerm('');
    onClose();
  };

  const getTypeIcon = (type: SavedMessage['type']) => {
    switch (type) {
      case 'connection':
        return <UserPlus className="h-3 w-3" />;
      case 'inmail':
        return <Mail className="h-3 w-3" />;
      default:
        return <MessageSquare className="h-3 w-3" />;
    }
  };

  const getTypeBadgeColor = (type: SavedMessage['type']) => {
    switch (type) {
      case 'connection':
        return 'bg-green-100 text-green-700';
      case 'inmail':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-purple-100 text-purple-700';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Select a Message for {actionType === 'connection-request' ? 'Connection Request' : 
              messageType === 'inmail' ? 'InMail' : 'Direct Message'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden">
          {/* Search and Create New */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                onCreateNew?.();
                handleClose();
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create New
            </Button>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No messages found</p>
                <p className="text-sm">
                  {searchTerm ? 
                    'Try a different search term or create a new message.' :
                    'Create your first message to get started.'
                  }
                </p>
              </div>
            ) : (
              <RadioGroup value={selectedMessageId} onValueChange={setSelectedMessageId}>
                <div className="space-y-3">
                  {filteredMessages.map((message) => (
                    <Card 
                      key={message.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedMessageId === message.id ? 'ring-2 ring-primary border-primary' : ''
                      }`}
                      onClick={() => setSelectedMessageId(message.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem value={message.id} className="mt-1" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-sm">{message.title}</h4>
                              <Badge className={`text-xs ${getTypeBadgeColor(message.type)}`}>
                                <span className="flex items-center gap-1">
                                  {getTypeIcon(message.type)}
                                  {message.type === 'connection' ? 'Connection' : 
                                   message.type === 'inmail' ? 'InMail' : 'Message'}
                                </span>
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                              {message.content}
                            </p>
                            <div className="text-xs text-muted-foreground mt-2">
                              Created {message.createdAt.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </RadioGroup>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSelect} 
            disabled={!selectedMessageId}
          >
            Select Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MessageSelectionModal;