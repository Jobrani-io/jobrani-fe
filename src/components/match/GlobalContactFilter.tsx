import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { X, Plus } from 'lucide-react';
import { ContactFilter } from '@/data/jobOpportunities';

interface GlobalContactFilterProps {
  filter: ContactFilter;
  onFilterChange: (filter: ContactFilter) => void;
  triggerWaitlistPopup: () => void;
  selectedStrategy?: string;
}

const GlobalContactFilter: React.FC<GlobalContactFilterProps> = ({ filter, onFilterChange, triggerWaitlistPopup, selectedStrategy }) => {
  const [includeInput, setIncludeInput] = useState('');
  const [excludeInput, setExcludeInput] = useState('');

  const addIncludeTitle = () => {
    if (includeInput.trim() && !filter.titlesToInclude.includes(includeInput.trim())) {
      onFilterChange({
        ...filter,
        titlesToInclude: [...filter.titlesToInclude, includeInput.trim()]
      });
      setIncludeInput('');
    }
  };

  const removeIncludeTitle = (title: string) => {
    onFilterChange({
      ...filter,
      titlesToInclude: filter.titlesToInclude.filter(t => t !== title)
    });
  };

  const addExcludeTitle = () => {
    if (excludeInput.trim() && !filter.titlesToExclude.includes(excludeInput.trim())) {
      onFilterChange({
        ...filter,
        titlesToExclude: [...filter.titlesToExclude, excludeInput.trim()]
      });
      setExcludeInput('');
    }
  };

  const removeExcludeTitle = (title: string) => {
    onFilterChange({
      ...filter,
      titlesToExclude: filter.titlesToExclude.filter(t => t !== title)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  return (
    <Card className="p-4 overflow-y-auto h-full">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Contact matching criteria</h3>
        
        {/* Titles to Include */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Titles to include</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add title..."
              value={includeInput}
              onChange={(e) => setIncludeInput(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, () => triggerWaitlistPopup())}
              onFocus={triggerWaitlistPopup}
              className="flex-1 text-sm"
            />
            <Button 
              onClick={triggerWaitlistPopup}
              size="sm"
              disabled={!includeInput.trim()}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {filter.titlesToInclude.map((title) => (
              <Badge key={title} variant="secondary" className="gap-1 text-xs">
                {title}
                <X 
                  className="h-2 w-2 cursor-pointer" 
                  onClick={() => removeIncludeTitle(title)} 
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Titles to Exclude */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Titles to exclude</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add title..."
              value={excludeInput}
              onChange={(e) => setExcludeInput(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, () => triggerWaitlistPopup())}
              onFocus={triggerWaitlistPopup}
              className="flex-1 text-sm"
            />
            <Button 
              onClick={triggerWaitlistPopup}
              size="sm"
              disabled={!excludeInput.trim()}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {filter.titlesToExclude.map((title) => (
              <Badge key={title} variant="destructive" className="gap-1 text-xs">
                {title}
                <X 
                  className="h-2 w-2 cursor-pointer" 
                  onClick={() => removeExcludeTitle(title)} 
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Exact Match Toggle */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch 
              id="exact-match"
              checked={filter.exactMatch}
              onCheckedChange={(checked) => {
                triggerWaitlistPopup();
              }}
            />
            <Label htmlFor="exact-match" className="text-sm">
              Exact match
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            When enabled, only shows precise keyword matches. Variations and localized titles will be filtered out (e.g., "Product Manager" won't match "Product Owner" or "Chef de Produit").
          </p>
        </div>
      </div>
    </Card>
  );
};

export default GlobalContactFilter;