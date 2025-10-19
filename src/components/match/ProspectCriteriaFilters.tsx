import React from 'react';
import { ChevronDown, ChevronUp, Briefcase, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ProspectFilters } from '@/types/prospectFilters';

interface ProspectCriteriaFiltersProps {
  filters: ProspectFilters;
  onFiltersChange: (filters: ProspectFilters) => void;
  triggerWaitlistPopup: () => void;
}

const ProspectCriteriaFilters = ({ filters, onFiltersChange, triggerWaitlistPopup }: ProspectCriteriaFiltersProps) => {
  const [jobTitleOpen, setJobTitleOpen] = React.useState(true);
  const [locationOpen, setLocationOpen] = React.useState(true);

  const updateJobTitleFilter = (field: string, value: any) => {
    onFiltersChange({
      ...filters,
      jobTitle: {
        ...filters.jobTitle,
        [field]: value
      }
    });
  };

  const updateLocationFilter = (field: string, value: any) => {
    onFiltersChange({
      ...filters,
      location: {
        ...filters.location,
        [field]: value
      }
    });
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg">Contact Matching Criteria</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Job Title Section */}
        <Collapsible open={jobTitleOpen} onOpenChange={setJobTitleOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="font-medium">Job title</span>
            </div>
            {jobTitleOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="seniority">Seniority</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="e.g. C-suite, Manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="c-suite">C-suite</SelectItem>
                  <SelectItem value="vp">VP</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="junior">Junior</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobFunctions">Job functions</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="e.g. Sales, Engineering" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="titlesToInclude">Job titles to include</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="e.g. CEO, VP, Director" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ceo">CEO</SelectItem>
                  <SelectItem value="cto">CTO</SelectItem>
                  <SelectItem value="vp">VP</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="titlesToExclude">Job titles to exclude</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="e.g. CEO, VP, Director" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intern">Intern</SelectItem>
                  <SelectItem value="assistant">Assistant</SelectItem>
                  <SelectItem value="coordinator">Coordinator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="exactMatch" className="text-sm">
                Exact keyword match
              </Label>
              <Switch
                id="exactMatch"
                checked={filters.jobTitle.exactKeywordMatch}
                onCheckedChange={(checked) => updateJobTitleFilter('exactKeywordMatch', checked)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Toggle this on to only show exact matches for your keywords. Similar and translated titles won't appear (e.g. "Frontend Engineer" and "Ingénieur logiciel" for "Software Developer").
            </p>
          </CollapsibleContent>
        </Collapsible>

        {/* Location Section */}
        <Collapsible open={locationOpen} onOpenChange={setLocationOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Location</span>
            </div>
            {locationOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="countriesToInclude">Countries to include</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="e.g. United States, Canada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="ca">Canada</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="de">Germany</SelectItem>
                  <SelectItem value="fr">France</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="countriesToExclude">Countries to exclude</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="e.g. France, Spain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">France</SelectItem>
                  <SelectItem value="es">Spain</SelectItem>
                  <SelectItem value="it">Italy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="regionsToInclude">Regions to include</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="e.g. NAM, LATAM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nam">NAM</SelectItem>
                  <SelectItem value="latam">LATAM</SelectItem>
                  <SelectItem value="emea">EMEA</SelectItem>
                  <SelectItem value="apac">APAC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="regionsToExclude">Regions to exclude</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="e.g. APAC, EMEA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apac">APAC</SelectItem>
                  <SelectItem value="emea">EMEA</SelectItem>
                  <SelectItem value="latam">LATAM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="citiesToInclude">Cities to include</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="e.g. San Francisco, London" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sf">San Francisco</SelectItem>
                  <SelectItem value="london">London</SelectItem>
                  <SelectItem value="nyc">New York</SelectItem>
                  <SelectItem value="paris">Paris</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="citiesToExclude">Cities to exclude</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="e.g. New York, Paris" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nyc">New York</SelectItem>
                  <SelectItem value="paris">Paris</SelectItem>
                  <SelectItem value="tokyo">Tokyo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statesToInclude">States, provinces, or municipalities to include</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="e.g. San Francisco, London" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ca">California</SelectItem>
                  <SelectItem value="ny">New York</SelectItem>
                  <SelectItem value="tx">Texas</SelectItem>
                  <SelectItem value="ontario">Ontario</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statesToExclude">States, provinces, or municipalities to exclude</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="e.g. New York, Paris" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ny">New York</SelectItem>
                  <SelectItem value="fl">Florida</SelectItem>
                  <SelectItem value="quebec">Quebec</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="searchRawLocation" className="text-sm">
                Search raw location field
              </Label>
              <Switch
                id="searchRawLocation"
                checked={filters.location.searchRawLocationField}
                onCheckedChange={(checked) => updateLocationFilter('searchRawLocationField', checked)}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Button 
          onClick={triggerWaitlistPopup}
          className="w-full"
          size="lg"
        >
          Search Prospects
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProspectCriteriaFilters;