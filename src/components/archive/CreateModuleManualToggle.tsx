/**
 * ARCHIVED COMPONENT - Manual Mode Toggle for CreateModule
 * 
 * This file contains the toggle UI and manual mode functionality that was removed 
 * from CreateModule.tsx to simplify it to auto-write only mode.
 * 
 * TO RESTORE MANUAL MODE:
 * 1. Import this component in CreateModule.tsx
 * 2. Add back the useAI state: const [useAI, setUseAI] = useState(true);
 * 3. Add back the Edit3 icon import: import { Edit3 } from 'lucide-react';
 * 4. Add back the MessageBuilder import: import MessageBuilder from '@/components/MessageBuilder';
 * 5. Replace the simplified content with the conditional rendering from this file
 * 6. Use the ToggleHeader component from this file in the main component
 */

import React from 'react';
import { Wand2, Edit3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import MessageBuilder from '@/components/MessageBuilder';

interface ToggleHeaderProps {
  useAI: boolean;
  setUseAI: (value: boolean) => void;
}

export const ToggleHeader: React.FC<ToggleHeaderProps> = ({ useAI, setUseAI }) => (
  <div className="flex justify-center items-center -mt-2">
    {/* Tab-like Toggle - centered both horizontally and vertically with logo */}
    <div className="inline-flex items-center rounded-lg bg-muted p-1">
      <button
        onClick={() => setUseAI(true)}
        className={`px-6 py-3 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 ${
          useAI 
            ? 'bg-background text-foreground shadow-sm' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Wand2 className="h-4 w-4" />
        Auto-Write Your Message
      </button>
      <button
        onClick={() => setUseAI(false)}
        className={`px-6 py-3 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 ${
          !useAI 
            ? 'bg-background text-foreground shadow-sm' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Edit3 className="h-4 w-4" />
        Write Your Own Message
      </button>
    </div>
  </div>
);

interface ConditionalContentProps {
  useAI: boolean;
  triggerWaitlistPopup: () => void;
  // Add other props that the AI mode needs (resume state, prospects, etc.)
}

export const ConditionalContent: React.FC<ConditionalContentProps> = ({ 
  useAI, 
  triggerWaitlistPopup 
}) => (
  <>
    {useAI ? (
      /* Single Column Layout - AI Mode */
      <Card className="-mt-8">
        <CardContent className="pt-6">
          {/* AI Mode content would go here - moved to main component */}
        </CardContent>
      </Card>
    ) : (
      /* Manual Message Builder Mode */
      <Card>
        <CardContent className="pt-6">
          <MessageBuilder triggerWaitlistPopup={triggerWaitlistPopup} />
        </CardContent>
      </Card>
    )}
  </>
);