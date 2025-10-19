// TheirStack API Types
// Based on https://api.theirstack.com/v1/jobs/search documentation

import { SavedProspect } from "@/services/savedProspectsService";

export interface TheirStackSearchFilters {
  // Pagination & Sorting
  order_by?: Array<{
    field: string;
    desc: boolean;
  }>;
  offset?: number;
  page?: number;
  limit?: number;

  // Job-Specific Filters
  job_title_or?: string[];
  job_title_not?: string[];
  job_title_pattern_and?: string[];
  job_title_pattern_or?: string[];
  job_title_pattern_not?: string[];
  job_country_code_or?: string[];
  job_country_code_not?: string[];
  posted_at_max_age_days?: number;
  posted_at_gte?: string;
  posted_at_lte?: string;
  discovered_at_gte?: string;
  discovered_at_lte?: string;
  job_description_contains_or?: string[];
  job_description_contains_not?: string[];
  remote?: boolean | null;
  job_seniority_or?: Array<
    "c_level" | "staff" | "senior" | "junior" | "mid_level"
  >;
  min_salary_usd?: number;
  max_salary_usd?: number;
  job_technology_slug_and?: string[];
  job_technology_slug_or?: string[];
  job_technology_slug_not?: string[];
  job_location_pattern_or?: string[];
  job_location_or?: Array<{
    id: string;
    name: string;
  }>;
  employment_statuses_or?: Array<
    "full_time" | "part_time" | "contract" | "temporary" | "internship"
  >;
  easy_apply?: boolean;

  // Company-Specific Filters
  company_name_or?: string[];
  company_name_case_insensitive_or?: string[];
  company_domain_or?: string[];
  company_linkedin_url_or?: string[];
  min_employee_count?: number;
  max_employee_count?: number;
  funding_stage_or?: string[];
  industry_id_or?: number[];
  only_yc_companies?: boolean;

  // Response Options
  include_total_results?: boolean;
  blur_company_data?: boolean;
}

export interface TheirStackLocation {
  name: string;
  city: string;
  state: string;
  country: string;
  country_code: string;
}

export interface TheirStackCompany {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  country: string | null;
  employee_count: number | null;
  logo: string | null;
  linkedin_url: string | null;
  long_description: string | null;
  technology_slugs: string[];
}

export interface TheirStackJob {
  id: string;
  job_title: string;
  url: string | null;
  date_posted: string; // yyyy-mm-dd format
  discovered_at: string; // yyyy-mm-ddTHH:mm:ssZ format
  remote: boolean | null;
  employment_statuses: string[];
  description: string | null;
  company_object: TheirStackCompany;
  locations: TheirStackLocation[];
  technology_slugs: string[];
  salary_string: string | null;
  min_annual_salary_usd: number | null;
  max_annual_salary_usd: number | null;
}

export interface TheirStackMetadata {
  total_results: number | null;
  total_companies: number | null;
  truncated_results: number;
  truncated_companies: number;
}

export interface TheirStackApiResponse {
  metadata: TheirStackMetadata;
  data: TheirStackJob[];
}

// Frontend search form interface
export interface ProspectSearchForm {
  jobTitles: string[];
  jobDescriptions: string[];
  jobLocations: string[];
  employmentTypes: string[];
  postingDate: string;
  companies: string[];
  isRemote: boolean;
  exactMode: boolean; // New field for exact vs expanded mode
  page?: number;
  limit?: number;
}

// Transformed prospect interface to match existing frontend expectations
export interface Prospect {
  id: string;
  organization: string;
  title: string;
  date_posted: string;
  locations_derived: string[];
  url: string;
  company_url: string;
  job_description: string;
  employment_type: string;
  is_remote: boolean;
  posted_human_readable?: string;
  raw?: SavedProspect;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
}

// Backend request/response interfaces
// expect-ts-error
export interface ProspectSearchRequest extends ProspectSearchForm {}

export interface ProspectSearchResponse {
  data: Prospect[];
  metadata: {
    total_results: number | null;
    page: number;
    limit: number;
    has_next_page: boolean;
  };
}
