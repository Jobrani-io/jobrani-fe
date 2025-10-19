import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Trash2, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import savedProspectsService, { SavedProspect, JobMatch } from '@/services/savedProspectsService';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface SavedProspectsListProps {
  onProspectMatch?: (jobId: string, matches: JobMatch[]) => void;
}

const SavedProspectsList = ({ onProspectMatch }: SavedProspectsListProps) => {
  const [savedProspects, setSavedProspects] = useState<SavedProspect[]>([]);
  const [jobMatches, setJobMatches] = useState<Map<string, JobMatch[]>>(new Map());
  const [isLoadingMatches, setIsLoadingMatches] = useState<Set<string>>(new Set());
  const { isLimitReached } = useSubscription();

  useEffect(() => {
    loadSavedProspects();
  }, []);

  const loadSavedProspects = async () => {
    const prospects = await savedProspectsService.getSavedProspects();
    setSavedProspects(prospects);
  };

  const handleDeleteProspect = async (prospectId: string) => {
    const success = await savedProspectsService.deleteSavedProspect(prospectId);
    if (success) {
      setSavedProspects(prev => prev.filter(prospect => prospect.prospect_id !== prospectId));
      setJobMatches(prev => {
        const newMap = new Map(prev);
        newMap.delete(prospectId);
        return newMap;
      });
    }
  };

  const handleMatchProspect = async (savedProspect: SavedProspect) => {
    if (isLoadingMatches.has(savedProspect.prospect_id)) return;
    if (isLimitReached('prospects_found')) return;
    
    setIsLoadingMatches(prev => new Set([...prev, savedProspect.prospect_id]));
    
    try {
      const matches = await savedProspectsService.getJobMatches(
        savedProspect.prospect_id,
        savedProspect.company,
        savedProspect.job_title,
        savedProspect.location || undefined
      );
      
      setJobMatches(prev => new Map(prev.set(savedProspect.prospect_id, matches)));
      
      if (onProspectMatch) {
        onProspectMatch(savedProspect.prospect_id, matches);
      }
    } catch (error) {
      console.error('Error matching prospect:', error);
    } finally {
      setIsLoadingMatches(prev => {
        const newSet = new Set(prev);
        newSet.delete(savedProspect.prospect_id);
        return newSet;
      });
    }
  };

  if (savedProspects.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="text-muted-foreground">
            <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No saved prospects</p>
            <p className="text-sm">Save prospects from the Prospect module to see them here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Saved Prospects ({savedProspects.length})</h2>
        <Button
          onClick={loadSavedProspects}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      <div className="grid gap-4">
        {savedProspects.map((savedProspect) => {
          const matches = jobMatches.get(savedProspect.prospect_id) || [];
          const isLoading = isLoadingMatches.has(savedProspect.prospect_id);
          
          return (
            <Card key={savedProspect.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{savedProspect.job_title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{savedProspect.company}</p>
                    {savedProspect.location && (
                      <p className="text-xs text-muted-foreground">{savedProspect.location}</p>
                    )}
                    {savedProspect.posted_on && (
                      <p className="text-xs text-muted-foreground">Posted: {savedProspect.posted_on}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Saved: {new Date(savedProspect.saved_date).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {matches.length > 0 ? (
                      <Badge variant="secondary" className="gap-1">
                        <Play className="h-3 w-3" />
                        {matches.length} matches
                      </Badge>
                    ) : (
                      <Button
                        onClick={() => handleMatchProspect(savedProspect)}
                        disabled={isLoading}
                        size="sm"
                        className="gap-2"
                      >
                        {isLoading ? (
                          <>
                            <RotateCcw className="h-4 w-4 animate-spin" />
                            Finding...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            Find Matches
                          </>
                        )}
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => handleDeleteProspect(savedProspect.prospect_id)}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {matches.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Hiring Manager Matches:</h4>
                    <div className="space-y-2">
                      {matches.map((match, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{match.name}</p>
                            <p className="text-xs text-muted-foreground">{match.title}</p>
                            <p className="text-xs text-muted-foreground">{match.reason}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {match.confidence}% match
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-xs"
                              onClick={() => window.open(match.linkedin_url, '_blank')}
                            >
                              View Profile
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SavedProspectsList;
