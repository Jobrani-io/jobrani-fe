import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Target, Plus, X } from 'lucide-react';
import { ProfileData, commonJobRoles } from '@/types/profileData';

interface TargetRolesProps {
  profileData: ProfileData;
  onProfileUpdate: (data: Partial<ProfileData>) => void;
}

const TargetRoles: React.FC<TargetRolesProps> = ({
  profileData,
  onProfileUpdate,
}) => {
  const [newRole, setNewRole] = useState('');

  const handleRoleAdd = (role: string) => {
    if (role && !profileData.desiredRoles.includes(role)) {
      onProfileUpdate({
        desiredRoles: [...profileData.desiredRoles, role],
      });
      setNewRole('');
    }
  };

  const handleRoleRemove = (role: string) => {
    onProfileUpdate({
      desiredRoles: profileData.desiredRoles.filter(r => r !== role),
    });
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4" />
          Target Roles
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          What positions are you looking for?
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Selected Roles */}
        {profileData.desiredRoles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {profileData.desiredRoles.map((role) => (
              <Badge key={role} variant="secondary" className="flex items-center gap-1 text-xs">
                {role}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => handleRoleRemove(role)}
                />
              </Badge>
            ))}
          </div>
        )}

        {/* Add Custom Role */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter a role title..."
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleRoleAdd(newRole);
              }
            }}
            className="text-sm"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRoleAdd(newRole)}
            disabled={!newRole.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Common Roles Quick Add */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Popular roles:</Label>
          <div className="flex flex-wrap gap-1">
            {commonJobRoles.slice(0, 4).map((role) => (
              <Button
                key={role}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => handleRoleAdd(role)}
                disabled={profileData.desiredRoles.includes(role)}
              >
                {role}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TargetRoles;