import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, Target, Sparkles, Building } from 'lucide-react';
import { ProfileData } from '@/types/profileData';

interface ProfilePreviewCardProps {
  profileData: ProfileData;
}

const ProfilePreviewCard: React.FC<ProfilePreviewCardProps> = ({ profileData }) => {
  const getInitials = () => {
    const firstName = profileData.firstName || '';
    const lastName = profileData.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'YO';
  };

  const getTopHighlights = () => {
    return profileData.personalHighlights
      .slice(0, 3)
      .map(h => h.text);
  };

  const getLocationSummary = () => {
    const { locationPreferences } = profileData;
    const types = [];
    if (locationPreferences.remote) types.push('Remote');
    if (locationPreferences.hybrid) types.push('Hybrid');
    if (locationPreferences.onsite) types.push('On-site');
    
    if (locationPreferences.cities.length > 0) {
      return `${locationPreferences.cities[0]}${locationPreferences.cities.length > 1 ? ` +${locationPreferences.cities.length - 1} more` : ''}`;
    }
    
    return types.length > 0 ? types.join(', ') : 'Flexible';
  };

  const getDesiredRoleSummary = () => {
    if (profileData.desiredRoles.length === 0) return 'Open to opportunities';
    if (profileData.desiredRoles.length === 1) return profileData.desiredRoles[0];
    return `${profileData.desiredRoles[0]} +${profileData.desiredRoles.length - 1} more`;
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Your Profile Preview
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          How you'll appear in the workflow
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar & Basic Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">
              {profileData.firstName && profileData.lastName
                ? `${profileData.firstName} ${profileData.lastName}`
                : 'Your Name'
              }
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {profileData.currentTitle || 'Current Title'}
            </div>
          </div>
        </div>

        {/* Desired Role */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Target Role</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {getDesiredRoleSummary()}
          </Badge>
        </div>

        {/* Location */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Location</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {getLocationSummary()}
          </Badge>
        </div>

        {/* Industry Preferences */}
        {profileData.industryPreferences.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Industries</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {profileData.industryPreferences.slice(0, 2).map((industry) => (
                <Badge key={industry} variant="outline" className="text-xs">
                  {industry}
                </Badge>
              ))}
              {profileData.industryPreferences.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{profileData.industryPreferences.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Top Highlights */}
        {getTopHighlights().length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Key Highlights</span>
            </div>
            <div className="space-y-1">
              {getTopHighlights().map((highlight, index) => (
                <div key={index} className="text-xs text-muted-foreground leading-relaxed">
                  • {highlight.length > 80 ? `${highlight.substring(0, 80)}...` : highlight}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Tokens Available */}
        <div className="pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground text-center">
            <span className="font-medium">Available tokens:</span> {`{Name}`}, {`{DesiredRole}`}, {`{Location}`}, {`{Highlight1}`}
            {getTopHighlights().length > 1 && `, {Highlight${getTopHighlights().length}}`}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePreviewCard;