import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Plus, X } from 'lucide-react';
import { ProfileData, commonCities } from '@/types/profileData';

interface LocationPreferencesProps {
  profileData: ProfileData;
  onProfileUpdate: (data: Partial<ProfileData>) => void;
}

const LocationPreferences: React.FC<LocationPreferencesProps> = ({
  profileData,
  onProfileUpdate,
}) => {
  const [newCity, setNewCity] = useState('');

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

  const handleLocationTypeChange = (type: 'remote' | 'hybrid' | 'onsite', checked: boolean) => {
    onProfileUpdate({
      locationPreferences: {
        ...profileData.locationPreferences,
        [type]: checked,
      },
    });
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Location Preferences
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Where are you willing to work?
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Work Type */}
        <div className="space-y-2">
          <Label className="text-sm">Work arrangement:</Label>
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
        <div className="space-y-2">
          <Label className="text-sm">Specific cities:</Label>
          
          {/* Selected Cities */}
          {profileData.locationPreferences.cities.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {profileData.locationPreferences.cities.map((city) => (
                <Badge key={city} variant="secondary" className="flex items-center gap-1 text-xs">
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
              className="text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCityAdd(newCity)}
              disabled={!newCity.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Common Cities Quick Add */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Popular locations:</Label>
            <div className="flex flex-wrap gap-1">
              {commonCities.slice(0, 4).map((city) => (
                <Button
                  key={city}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
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
  );
};

export default LocationPreferences;