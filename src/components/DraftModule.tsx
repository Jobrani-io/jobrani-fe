import React, { useState } from 'react';
import { Brain, FolderOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import MessageBuilder from './MessageBuilder';
import { useMessageLibrary } from '@/hooks/useMessageLibrary';

const DraftModule = () => {
  const [selectedOption, setSelectedOption] = useState<"create" | "see">("create");
  const { messages } = useMessageLibrary();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Action Cards Layout */}
      <div className="grid grid-cols-3 gap-4 md:gap-8">
        {/* Create Draft */}
        <Card 
          className={`col-span-2 h-20 cursor-pointer transition-all ${
            selectedOption === "create" 
              ? "border-primary shadow-lg ring-2 ring-primary/20" 
              : "hover:shadow-lg"
          }`}
          onClick={() => setSelectedOption("create")}
        >
          <CardContent className="p-4 h-full flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                selectedOption === "create" ? "bg-primary/10" : "bg-muted"
              }`}>
                <Brain className={`h-6 w-6 ${
                  selectedOption === "create" ? "text-primary" : "text-muted-foreground"
                }`} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Build Your Message</h3>
                <p className="text-sm text-muted-foreground mt-1">Use a template or write your own. You'll review every message before it's sent.</p>
              </div>
            </div>
            {selectedOption === "create" && (
              <div className="h-3 w-3 rounded-full bg-primary"></div>
            )}
          </CardContent>
        </Card>

        {/* See Drafts */}
        <Card 
          className={`col-span-1 h-20 cursor-pointer transition-all ${
            selectedOption === "see" 
              ? "border-primary shadow-lg ring-2 ring-primary/20" 
              : "hover:shadow-lg"
          }`}
          onClick={() => setSelectedOption("see")}
        >
          <CardContent className="p-4 h-full flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                selectedOption === "see" ? "bg-primary/10" : "bg-muted"
              }`}>
                <FolderOpen className={`h-6 w-6 ${
                  selectedOption === "see" ? "text-primary" : "text-muted-foreground"
                }`} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">See Drafts</h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {messages.length}
                </span>
              )}
              {selectedOption === "see" && (
                <div className="h-3 w-3 rounded-full bg-primary"></div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conditional Content */}
      {selectedOption === "create" ? (
        <MessageBuilder />
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Saved Drafts</h2>
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No drafts saved yet</p>
              <p className="text-sm">Create your first draft to see it here</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {messages.map((message, index) => (
                <Card 
                  key={message.id}
                  id={index === 0 ? "first-saved-message" : undefined}
                >
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">{message.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {message.content}
                    </p>
                    <div className="mt-2 flex items-center text-xs text-muted-foreground">
                      <span>Created: {new Date(message.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DraftModule;