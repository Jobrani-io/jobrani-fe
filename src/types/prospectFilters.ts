export interface JobTitleFilter {
  seniority: string[];
  jobFunctions: string[];
  titlesToInclude: string[];
  titlesToExclude: string[];
  exactKeywordMatch: boolean;
}

export interface LocationFilter {
  countriesToInclude: string[];
  countriesToExclude: string[];
  regionsToInclude: string[];
  regionsToExclude: string[];
  citiesToInclude: string[];
  citiesToExclude: string[];
  statesToInclude: string[];
  statesToExclude: string[];
  searchRawLocationField: boolean;
}

export interface ProspectFilters {
  jobTitle: JobTitleFilter;
  location: LocationFilter;
}

export const defaultJobTitleFilter: JobTitleFilter = {
  seniority: [],
  jobFunctions: [],
  titlesToInclude: [],
  titlesToExclude: [],
  exactKeywordMatch: false,
};

export const defaultLocationFilter: LocationFilter = {
  countriesToInclude: [],
  countriesToExclude: [],
  regionsToInclude: [],
  regionsToExclude: [],
  citiesToInclude: [],
  citiesToExclude: [],
  statesToInclude: [],
  statesToExclude: [],
  searchRawLocationField: false,
};

export const defaultProspectFilters: ProspectFilters = {
  jobTitle: defaultJobTitleFilter,
  location: defaultLocationFilter,
};