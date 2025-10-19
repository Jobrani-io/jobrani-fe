import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useMessageLibrary, SavedMessage } from '@/hooks/useMessageLibrary';
import { toast } from 'sonner';
import { MESSAGE_TEMPLATES, SMART_TOKENS, AI_TOKENS } from '@/constants/messageTemplates';

interface MessageBuilderWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (message: SavedMessage) => void;
  actionType: 'send-message' | 'connection-request';
  messageType: 'message' | 'inmail';
}

const MessageBuilderWorkflowModal: React.FC<MessageBuilderWorkflowModalProps> = ({
  isOpen,
  onClose,
  onSave,
  actionType,
  messageType
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [messageContent, setMessageContent] = useState<string>('');
  const [messageTitle, setMessageTitle] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { saveMessage } = useMessageLibrary();

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = MESSAGE_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setMessageContent(template.content);
      setMessageTitle(template.name);
    }
  };

  const insertToken = (token: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newContent = messageContent.slice(0, start) + token + messageContent.slice(end);
      setMessageContent(newContent);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + token.length, start + token.length);
      }, 0);
    }
  };

  const handleSave = () => {
    if (!messageContent.trim() || !messageTitle.trim()) return;

    const savedMessageType: SavedMessage['type'] = 
      actionType === 'connection-request' ? 'connection' :
      messageType === 'inmail' ? 'inmail' : 'message';

    const savedMessage = saveMessage(messageTitle, messageContent, savedMessageType);
    onSave(savedMessage);
    handleClose();
    toast.success('Message created and saved!');
  };

  const handleClose = () => {
    setSelectedTemplate('');
    setMessageContent('');
    setMessageTitle('');
    onClose();
  };

  const getTypeDisplay = () => {
    if (actionType === 'connection-request') return 'Connection Request';
    return messageType === 'inmail' ? 'InMail' : 'Direct Message';
  };

  const getTypeBadgeColor = () => {
    if (actionType === 'connection-request') return 'bg-green-100 text-green-700';
    return messageType === 'inmail' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>Create New Message</DialogTitle>
            <Badge className={`text-xs ${getTypeBadgeColor()}`}>
              {getTypeDisplay()}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="flex gap-6 flex-1 overflow-hidden">
          {/* Left Panel - Templates */}
          <div className="w-2/5 overflow-y-auto">
            <div className="mb-4">
              <h3 className="font-medium mb-3">Choose a Template</h3>
              <RadioGroup value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <div className="space-y-3">
                  {MESSAGE_TEMPLATES.map((template) => (
                    <Card 
                      key={template.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedTemplate === template.id ? 'ring-2 ring-primary border-primary' : ''
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem value={template.id} className="mt-1" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm mb-2">{template.name}</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {template.content}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Right Panel - Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="mb-4">
              <h3 className="font-medium mb-3">Customize Your Message</h3>
              
              {/* Message Title */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Message Title</label>
                <input
                  type="text"
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                  placeholder="e.g., Software Engineer Outreach"
                  className="w-full px-3 py-2 border border-border rounded-md text-sm"
                />
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              <Textarea
                ref={textareaRef}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Select a template or write your own message..."
                className="flex-1 resize-none text-sm"
              />
              <div className="flex justify-end mt-2">
                <span className="text-xs text-muted-foreground">
                  {messageContent.length} characters
                </span>
              </div>
            </div>

            {/* Smart Tokens */}
            <Card className="mt-4 bg-muted/50">
              <CardContent className="p-4">
                <div className="mb-3">
                  <h4 className="font-medium text-sm mb-1">Smart Tokens</h4>
                  <p className="text-xs text-muted-foreground">
                    Click to insert into your message
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SMART_TOKENS.map((tokenItem) => (
                    <button
                      key={tokenItem.token}
                      onClick={() => insertToken(tokenItem.token)}
                      className="px-3 py-1.5 bg-background hover:bg-accent text-xs font-medium rounded-md border border-border hover:border-accent-foreground/20 transition-colors"
                    >
                      {tokenItem.label}
                    </button>
                  ))}
                  {AI_TOKENS.map((tokenItem) => (
                    <button
                      key={tokenItem.token}
                      onClick={() => insertToken(tokenItem.token)}
                      className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 text-xs font-medium rounded-md border border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200"
                    >
                      ✨ {tokenItem.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!messageContent.trim() || !messageTitle.trim()}
          >
            Save & Use Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MessageBuilderWorkflowModal;