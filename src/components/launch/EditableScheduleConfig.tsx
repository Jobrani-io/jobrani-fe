import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Clock,
  Save,
  X
} from 'lucide-react';

interface ScheduleConfig {
  workingDays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  startTime: string;
  endTime: string;
  timezone: string;
  dailyLimit: number;
}

interface EditableScheduleConfigProps {
  scheduleConfig: ScheduleConfig;
  onScheduleUpdate: (config: ScheduleConfig) => void;
}

export const EditableScheduleConfig: React.FC<EditableScheduleConfigProps> = ({
  scheduleConfig,
  onScheduleUpdate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempConfig, setTempConfig] = useState<ScheduleConfig>(scheduleConfig);

  const weekDays = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' }
  ];

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney'
  ];

  const handleSave = () => {
    onScheduleUpdate(tempConfig);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempConfig(scheduleConfig);
    setIsEditing(false);
  };

  const handleDayToggle = (day: keyof ScheduleConfig['workingDays']) => {
    setTempConfig(prev => ({
      ...prev,
      workingDays: {
        ...prev.workingDays,
        [day]: !prev.workingDays[day]
      }
    }));
  };

  const getActiveDaysCount = () => {
    return Object.values(scheduleConfig.workingDays).filter(Boolean).length;
  };

  return (
    <div className="border rounded-lg">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5" />
              <div className="text-left">
                <h3 className="font-semibold">Schedule Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  {getActiveDaysCount()} days • {scheduleConfig.startTime}-{scheduleConfig.endTime} • {scheduleConfig.dailyLimit}/day
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                    setIsOpen(true);
                  }}
                >
                  Edit
                </Button>
              )}
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-6">
            {/* Working Days */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Working Days</Label>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map(({ key, label }) => (
                  <div key={key} className="flex flex-col items-center space-y-2">
                    <Label className="text-xs">{label}</Label>
                    <Checkbox
                      checked={isEditing ? tempConfig.workingDays[key as keyof typeof tempConfig.workingDays] : scheduleConfig.workingDays[key as keyof typeof scheduleConfig.workingDays]}
                      onCheckedChange={() => isEditing && handleDayToggle(key as keyof ScheduleConfig['workingDays'])}
                      disabled={!isEditing}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Working Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Start Time</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={isEditing ? tempConfig.startTime : scheduleConfig.startTime}
                    onChange={(e) => isEditing && setTempConfig(prev => ({ ...prev, startTime: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">End Time</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={isEditing ? tempConfig.endTime : scheduleConfig.endTime}
                    onChange={(e) => isEditing && setTempConfig(prev => ({ ...prev, endTime: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Timezone</Label>
              <Select
                value={isEditing ? tempConfig.timezone : scheduleConfig.timezone}
                onValueChange={(value) => isEditing && setTempConfig(prev => ({ ...prev, timezone: value }))}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Daily Limit */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Daily Message Limit</Label>
              <Input
                type="number"
                min="1"
                max="500"
                value={isEditing ? tempConfig.dailyLimit : scheduleConfig.dailyLimit}
                onChange={(e) => isEditing && setTempConfig(prev => ({ ...prev, dailyLimit: parseInt(e.target.value) || 0 }))}
                disabled={!isEditing}
              />
            </div>

            {/* Edit Actions */}
            {isEditing && (
              <div className="flex gap-2 pt-4 border-t">
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-3 w-3 mr-1" />
                  Save Changes
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};