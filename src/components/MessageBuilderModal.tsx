import React, { useState } from 'react';
import { ArrowLeft, Save, ChevronRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MESSAGE_TEMPLATES } from '@/constants/messageTemplates';

interface MessageBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MessageBuilderModal: React.FC<MessageBuilderModalProps> = ({ isOpen, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [messageContent, setMessageContent] = useState<string>('');

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = MESSAGE_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setMessageContent(template.content);
    }
  };

  const handleClose = () => {
    setSelectedTemplate('');
    setMessageContent('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl h-[80vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-2xl">Build Your Message</DialogTitle>
          <DialogDescription className="text-base">
            Use a suggested template or write your own. You'll review every message before it's sent.
          </DialogDescription>
        </DialogHeader>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Templates */}
          <div className="w-2/5 border-r p-6 overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Suggested Templates</h3>
              <p className="text-sm text-muted-foreground">
                Pick one to start — we'll customize it for each hiring manager.
              </p>
            </div>

            <RadioGroup value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <div className="space-y-4">
                {MESSAGE_TEMPLATES.map((template) => (
                  <Card 
                    key={template.id}
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

            {/* Smart Tokens Info */}
            <Card className="mt-6 bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm mb-1">Smart Tokens</h4>
                    <p className="text-xs text-muted-foreground">
                      All templates use smart tokens like <code className="bg-background px-1 rounded">{'{FirstName}'}</code>, <code className="bg-background px-1 rounded">{'{Company}'}</code>, and <code className="bg-background px-1 rounded">{'{JobTitle}'}</code> — personalize once, scale fast.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Editor */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Customize or Write Your Own</h3>
              <p className="text-sm text-muted-foreground">
                Start from a template (pre-filled), or delete and write your own from scratch.
              </p>
            </div>

            <div className="flex-1">
              <Textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Select a template from the left, or start writing your own message here..."
                className="h-full resize-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-between items-center">
          <Button variant="outline" onClick={handleClose}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="flex space-x-3">
            <Button variant="secondary">
              <Save className="mr-2 h-4 w-4" />
              Save Template
            </Button>
            <Button variant="hero" disabled={!messageContent.trim()}>
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageBuilderModal;