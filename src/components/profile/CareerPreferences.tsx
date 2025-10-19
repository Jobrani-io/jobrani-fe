import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Target, Building, DollarSign, Plus, X } from 'lucide-react';
import { ProfileData, commonJobRoles, commonIndustries, commonCities } from '@/types/profileData';

interface CareerPreferencesProps {
  profileData: ProfileData;
  onProfileUpdate: (data: Partial<ProfileData>) => void;
}

const CareerPreferences: React.FC<CareerPreferencesProps> = ({
  profileData,
  onProfileUpdate,
}) => {
  const [newRole, setNewRole] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newIndustry, setNewIndustry] = useState('');

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

  const handleCityAdd = (city: string) => {
    if (city && !profileData.locationPreferences.cities.includes(city)) {
      onProfileUpdate({
        locationPreferences: {
          ...profileData.locationPreferences,
          cities: [...profileData.locationPreferences.cities, city],
        },
      });
      setNewCity('');
    }
  };

  const handleCityRemove = (city: string) => {
    onProfileUpdate({
      locationPreferences: {
        ...profileData.locationPreferences,
        cities: profileData.locationPreferences.cities.filter(c => c !== city),
      },
    });
  };

  const handleIndustryAdd = (industry: string) => {
    if (industry && !profileData.industryPreferences.includes(industry)) {
      onProfileUpdate({
        industryPreferences: [...profileData.industryPreferences, industry],
      });
      setNewIndustry('');
    }
  };

  const handleIndustryRemove = (industry: string) => {
    onProfileUpdate({
      industryPreferences: profileData.industryPreferences.filter(i => i !== industry),
    });
  };

  const handleLocationTypeChange = (type: 'remote' | 'hybrid' | 'onsite', checked: boolean) => {
    onProfileUpdate({
      locationPreferences: {
        ...profileData.locationPreferences,
        [type]: checked,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Desired Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Desired Roles
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            What positions are you looking for?
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Roles */}
          {profileData.desiredRoles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {profileData.desiredRoles.map((role) => (
                <Badge key={role} variant="secondary" className="flex items-center gap-1">
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
            />
            <Button
              variant="outline"
              onClick={() => handleRoleAdd(newRole)}
              disabled={!newRole.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Common Roles Quick Add */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Popular roles:</Label>
            <div className="flex flex-wrap gap-2">
              {commonJobRoles.slice(0, 6).map((role) => (
                <Button
                  key={role}
                  variant="outline"
                  size="sm"
                  className="text-xs"
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

      {/* Location Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Preferences
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Where are you willing to work?
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Work Type */}
          <div className="space-y-3">
            <Label>Work arrangement:</Label>
            <div className="flex flex-col gap-2">
              {[
                { key: 'remote', label: 'Remote' },
                { key: 'hybrid', label: 'Hybrid' },
                { key: 'onsite', label: 'On-site' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={profileData.locationPreferences[key as 'remote' | 'hybrid' | 'onsite'] || false}
                    onCheckedChange={(checked) => 
                      handleLocationTypeChange(key as 'remote' | 'hybrid' | 'onsite', checked as boolean)
                    }
                  />
                  <Label htmlFor={key} className="text-sm">{label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Specific Cities */}
          <div className="space-y-3">
            <Label>Specific cities/regions:</Label>
            
            {/* Selected Cities */}
            {profileData.locationPreferences.cities.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {profileData.locationPreferences.cities.map((city) => (
                  <Badge key={city} variant="secondary" className="flex items-center gap-1">
                    {city}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleCityRemove(city)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Add City */}
            <div className="flex gap-2">
              <Input
                placeholder="Enter city, state..."
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCityAdd(newCity);
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={() => handleCityAdd(newCity)}
                disabled={!newCity.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Common Cities Quick Add */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Popular locations:</Label>
              <div className="flex flex-wrap gap-2">
                {commonCities.slice(0, 6).map((city) => (
                  <Button
                    key={city}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleCityAdd(city)}
                    disabled={profileData.locationPreferences.cities.includes(city)}
                  >
                    {city}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Industry Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Industry Preferences
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            What industries interest you? (Optional)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Industries */}
          {profileData.industryPreferences.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {profileData.industryPreferences.map((industry) => (
                <Badge key={industry} variant="secondary" className="flex items-center gap-1">
                  {industry}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleIndustryRemove(industry)}
                  />
                </Badge>
              ))}
            </div>
          )}

          {/* Add Industry */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter industry..."
              value={newIndustry}
              onChange={(e) => setNewIndustry(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleIndustryAdd(newIndustry);
                }
              }}
            />
            <Button
              variant="outline"
              onClick={() => handleIndustryAdd(newIndustry)}
              disabled={!newIndustry.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Common Industries Quick Add */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Popular industries:</Label>
            <div className="flex flex-wrap gap-2">
              {commonIndustries.slice(0, 6).map((industry) => (
                <Button
                  key={industry}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleIndustryAdd(industry)}
                  disabled={profileData.industryPreferences.includes(industry)}
                >
                  {industry}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary Range */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Salary Range
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            What's your target salary range? (Optional)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="min-salary">Minimum</Label>
              <Input
                id="min-salary"
                type="number"
                placeholder="60000"
                value={profileData.salaryRange?.min || ''}
                onChange={(e) => {
                  const min = parseInt(e.target.value) || undefined;
                  onProfileUpdate({
                    salaryRange: {
                      ...profileData.salaryRange,
                      min,
                      currency: profileData.salaryRange?.currency || 'USD',
                    },
                  });
                }}
              />
            </div>
            <div>
              <Label htmlFor="max-salary">Maximum</Label>
              <Input
                id="max-salary"
                type="number"
                placeholder="120000"
                value={profileData.salaryRange?.max || ''}
                onChange={(e) => {
                  const max = parseInt(e.target.value) || undefined;
                  onProfileUpdate({
                    salaryRange: {
                      ...profileData.salaryRange,
                      max,
                      currency: profileData.salaryRange?.currency || 'USD',
                    },
                  });
                }}
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={profileData.salaryRange?.currency || 'USD'}
                onValueChange={(currency) => {
                  onProfileUpdate({
                    salaryRange: {
                      ...profileData.salaryRange,
                      currency,
                    },
                  });
                }}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CareerPreferences;