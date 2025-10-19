export interface ApolloPersonData {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  linkedin_url: string | null;
  title: string;
  email_status: "verified" | "unverified" | string;
  photo_url: string | null;
  twitter_url: string | null;
  github_url: string | null;
  facebook_url: string | null;
  extrapolated_email_confidence: number | null;
  headline: string | null;
  email: string;
  organization_id: string | null;

  employment_history: EmploymentHistory[];

  street_address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  formatted_address: string | null;
  time_zone: string | null;
  restricted: boolean;

  organization: Organization;

  departments: string[];
  subdepartments: string[];
  seniority: string | null;
  functions: string[];
  intent_strength: number | null;
  show_intent: boolean;
  email_domain_catchall: boolean;
  revealed_for_current_team: boolean;
}

interface EmploymentHistory {
  _id: string;
  created_at: string | null;
  current: boolean;
  degree: string | null;
  description: string | null;
  emails: string | string[] | null;
  end_date: string | null;
  grade_level: string | null;
  kind: string | null;
  major: string | null;
  organization_id: string | null;
  organization_name: string;
  raw_address: string | null;
  start_date: string | null;
  title: string | null;
  updated_at: string | null;
  id: string;
  key: string;
}

interface Organization {
  id: string;
  name: string;
  website_url: string | null;
  blog_url: string | null;
  angellist_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  facebook_url: string | null;
  primary_phone: {
    number: string;
    source: string;
    sanitized_number: string;
  } | null;
  languages: string[];
  alexa_ranking: number | null;
  phone: string | null;
  linkedin_uid: string | null;
  founded_year: number | null;
  publicly_traded_symbol: string | null;
  publicly_traded_exchange: string | null;
  logo_url: string | null;
  crunchbase_url: string | null;
  primary_domain: string | null;
  sic_codes: string[];
  naics_codes: string[];
  sanitized_phone: string | null;
  market_cap: string | null;
  organization_headcount_six_month_growth: number | null;
  organization_headcount_twelve_month_growth: number | null;
  organization_headcount_twenty_four_month_growth: number | null;
}

export interface ApolloApiResponse {
  breadcrumbs: Breadcrumb[];
  partial_results_only: boolean;
  has_join: boolean;
  disable_eu_prospecting: boolean;
  partial_results_limit: number;
  pagination: Pagination;
  people: ApolloPersonData[];
  model_ids: string[];
  num_fetch_result: number | null;
  derived_params: null;
  headers: ResponseHeaders;
}

interface Breadcrumb {
  label: string;
  signal_field_name: string;
  value: string | string[] | boolean;
  display_name: string;
}

interface Pagination {
  page: number;
  per_page: number;
  total_entries: number;
  total_pages: number;
}

interface ResponseHeaders {
  "cache-control": string;
  "cf-cache-status": string;
  "cf-ray": string;
  connection: string;
  "content-encoding": string;
  "content-security-policy": string;
  "content-type": string;
  date: string;
  etag: string;
  server: string;
  "set-cookie": string | string[];
  "strict-transport-security": string;
  "transfer-encoding": string;
  vary: string;
  "x-24-hour-requests-left": string;
  "x-24-hour-usage": string;
  "x-content-type-options": string;
  "x-frame-options": string;
  "x-hourly-requests-left": string;
  "x-hourly-usage": string;
  "x-minute-requests-left": string;
  "x-minute-usage": string;
  "x-rate-limit-24-hour": string;
  "x-rate-limit-hourly": string;
  "x-rate-limit-minute": string;
  "x-request-id": string;
  "x-runtime": string;
  "x-transaction-id": string;
}
