import React, { useState, useRef } from 'react';
import { ArrowLeft, Bookmark, ChevronRight, Info, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useMessageLibrary } from '@/hooks/useMessageLibrary';
import MessageSaveModal from './MessageSaveModal';
import { toast } from 'sonner';
import { MESSAGE_TEMPLATES, SMART_TOKENS, AI_TOKENS } from '@/constants/messageTemplates';

interface MessageBuilderProps {
  triggerWaitlistPopup?: () => void;
}

const MessageBuilder: React.FC<MessageBuilderProps> = ({ triggerWaitlistPopup }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [messageContent, setMessageContent] = useState<string>('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { saveMessage, messages } = useMessageLibrary();

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = MESSAGE_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setMessageContent(template.content);
    }
  };

  const insertToken = (token: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newContent = messageContent.slice(0, start) + token + messageContent.slice(end);
      setMessageContent(newContent);
      
      // Focus back to textarea and set cursor position after the inserted token
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + token.length, start + token.length);
      }, 0);
    }
  };

  const handleSaveMessage = (title: string, type: 'connection' | 'message' | 'inmail') => {
    saveMessage(title, messageContent, type);
    toast.success('Message saved to library!');
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Main Content */}
      <div className="flex gap-8 min-h-[600px]">
        {/* Left Panel - Templates */}
        <div className="w-2/5">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Suggested Templates</h3>
          </div>

              <RadioGroup value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <div className="space-y-4">
                  {MESSAGE_TEMPLATES.map((template) => (
                <Card 
                  key={template.id}
                  id={template.id === MESSAGE_TEMPLATES[0]?.id ? "first-message-template" : undefined}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedTemplate === template.id ? 'ring-2 ring-primary border-primary' : ''
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardContent className="p-4">
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

        {/* Right Panel - Editor */}
        <div className="flex-1 flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Customize or Write Your Own</h3>
          </div>

          <div>
            <Textarea
              ref={textareaRef}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Select a template from the left, or start writing your own message here..."
              className="min-h-[214px] resize-none text-sm"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-muted-foreground">
                {messageContent.length} characters
              </span>
              <Button 
                onClick={() => triggerWaitlistPopup?.()}
                disabled={!messageContent.trim()}
                size="sm"
                variant="outline"
              >
                <Bookmark className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>

          {/* Smart Tokens */}
          <Card className="mt-3 bg-muted/50">
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

      {/* Save Modal */}
      <MessageSaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveMessage}
        messageContent={messageContent}
      />
    </div>
  );
};

export default MessageBuilder;