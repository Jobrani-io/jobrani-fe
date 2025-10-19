import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Award, Briefcase, User, FileText } from 'lucide-react';
import { ProfileData, PersonalHighlight } from '@/types/profileData';

interface CompactPersonalHighlightsProps {
  profileData: ProfileData;
}

const CompactPersonalHighlights: React.FC<CompactPersonalHighlightsProps> = ({
  profileData,
}) => {
  const getCategoryIcon = (category: PersonalHighlight['category']) => {
    switch (category) {
      case 'achievement': return Award;
      case 'skill': return Sparkles;
      case 'experience': return Briefcase;
      default: return User;
    }
  };

  const getCategoryColor = (category: PersonalHighlight['category']) => {
    switch (category) {
      case 'achievement': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'skill': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'experience': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (profileData.personalHighlights.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No highlights yet</p>
      </div>
    );
  }

  const displayHighlights = profileData.personalHighlights.slice(0, 3);
  const remainingCount = profileData.personalHighlights.length - 3;

  return (
    <div className="space-y-2">
      {displayHighlights.map((highlight) => {
        const CategoryIcon = getCategoryIcon(highlight.category);
        
        return (
          <div key={highlight.id} className="flex items-start gap-2 p-2 bg-muted/30 rounded-md">
            <div className={`p-1 rounded ${getCategoryColor(highlight.category)} flex-shrink-0`}>
              <CategoryIcon className="h-3 w-3" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs leading-relaxed line-clamp-2">{highlight.text}</p>
              {highlight.isFromResume && (
                <Badge variant="outline" className="mt-1 text-xs h-4 px-1">
                  <FileText className="h-2 w-2 mr-1" />
                  Resume
                </Badge>
              )}
            </div>
          </div>
        );
      })}
      
      {remainingCount > 0 && (
        <p className="text-xs text-muted-foreground text-center pt-1">
          +{remainingCount} more highlights
        </p>
      )}
    </div>
  );
};

export default CompactPersonalHighlights;