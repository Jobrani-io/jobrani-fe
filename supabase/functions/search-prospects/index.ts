import {
  normalizeInput,
  removeFillerWords,
  searchJobTitles,
} from "../../utils/titles.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { logUsage } from "../_shared/usage.ts";

/* ---------- Constants ---------- */
const THEIRSTACK_API_KEY_NAME = "THEIRSTACK_API_KEY";
const THEIRSTACK_ENDPOINT = "https://api.theirstack.com/v1/jobs/search";
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/* ---------- Types ---------- */
type Body = {
  jobTitles?: string[];
  jobDescriptions?: string[];
  jobLocations?: string[];
  employmentTypes?: string[];
  postingDate?: string;
  companies?: string[];
  isRemote?: boolean;
  exactMode?: boolean; // New field for exact vs expanded mode
  page?: number;
  limit?: number;
};

// TheirStack API Types
interface TheirStackLocation {
  name: string;
  city: string;
  state: string;
  country: string;
  country_code: string;
}

interface TheirStackCompany {
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

interface TheirStackJob {
  id: string;
  job_title: string;
  url: string | null;
  date_posted: string;
  discovered_at: string;
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

interface TheirStackApiResponse {
  metadata: {
    total_results: number | null;
    total_companies: number | null;
    truncated_results: number;
    truncated_companies: number;
  };
  data: TheirStackJob[];
}

/* ---------- Small Helpers ---------- */

// Map frontend posting date to max age in days
function mapPostingDateToMaxAge(postingDate?: string): number {
  if (!postingDate) return 30; // Default to 30 days

  const date = postingDate.toLowerCase();
  if (date.includes("today")) return 1;
  if (date.includes("3")) return 3;
  if (date.includes("week")) return 7;
  if (date.includes("month")) return 30;
  if (date.includes("all")) return 365; // 1 year for "all"

  return 30; // Default fallback
}

// Map frontend employment types to TheirStack format
function mapEmploymentTypes(types?: string[]): string[] | undefined {
  if (!types?.length) return undefined;

  const mapping: Record<string, string> = {
    FULL_TIME: "full_time",
    PART_TIME: "part_time",
    CONTRACTOR: "contract",
    INTERNSHIP: "internship",
  };

  return types.map((type) => mapping[type] || type.toLowerCase());
}

/* ---------- Payload Builder ---------- */
interface TheirStackPayload {
  page?: number;
  limit?: number;
  posted_at_max_age_days?: number;
  job_title_or?: string[];
  job_title_pattern_or?: string[];
  job_description_contains_or?: string[];
  company_name_case_insensitive_or?: string[];
  job_country_code_or?: string[];
  job_location_pattern_or?: string[];
  remote?: boolean;
  employment_statuses_or?: string[];
  include_total_results?: boolean;
}

function buildTheirStackPayload(body: Body): TheirStackPayload {
  const payload: TheirStackPayload = {};

  // Pagination - use page-based pagination
  if (body.page !== undefined) {
    payload.page = Math.max(1, body.page);
  } else {
    payload.page = 1;
  }

  // Limit results (default to 10, max 100)
  payload.limit = Math.min(body.limit || DEFAULT_LIMIT, MAX_LIMIT);

  // Required: posted_at_max_age_days (at least one date filter is required)
  payload.posted_at_max_age_days = mapPostingDateToMaxAge(body.postingDate);

  // Job title search - use exact mode or expanded mode based on exactMode flag
  if (body.jobTitles?.length) {
    if (body.exactMode) {
      // Exact mode: use job_title_or for natural language patterns
      payload.job_title_or = body.jobTitles.map((title) =>
        removeFillerWords(normalizeInput(title))
      );
    } else {
      // Expanded mode: process titles through seniority bucketing and normalization
      const processedTitles: string[] = [];
      for (const jobTitles of body.jobTitles) {
        const searchedTitles = searchJobTitles(jobTitles, {
          exactMode: false,
        });
        processedTitles.push(...searchedTitles.patterns);
      }

      // Use job_title_pattern_or for the processed patterns
      payload.job_title_pattern_or = processedTitles;
    }
  }

  // Job description keywords
  if (body.jobDescriptions?.length) {
    payload.job_description_contains_or = body.jobDescriptions;
  }

  // Company filtering
  if (body.companies?.length) {
    payload.company_name_case_insensitive_or = body.companies;
  }

  if (body.jobLocations?.length && !body.jobLocations.includes("Remote")) {
    payload.job_location_pattern_or = body.jobLocations.map((location) =>
      location.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );
  }

  // Remote work preference
  if (body.isRemote) {
    payload.remote = true;
  }

  // Employment types
  const employmentTypes = mapEmploymentTypes(body.employmentTypes);
  if (employmentTypes) {
    payload.employment_statuses_or = employmentTypes;
  }

  // Include total results for pagination
  payload.include_total_results = true;

  return payload;
}

/* ---------- Handler ---------- */
export async function handleRequest(req: Request): Promise<Response> {
  console.log("search-prospects Edge Function called with params: ", req.body);
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Use POST with JSON body" }), {
      status: 405,
      headers: { "content-type": "application/json", ...CORS },
    });
  }

  const apiKey = Deno.env.get(THEIRSTACK_API_KEY_NAME);
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "THEIRSTACK_API_KEY missing" }),
      {
        status: 500,
        headers: { "content-type": "application/json", ...CORS },
      }
    );
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabaseClient.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json", ...CORS },
    });
  }

  const body = await req.json();

  const payload = buildTheirStackPayload(body);

  console.log("THEIRSTACK payload", JSON.stringify(payload, null, 2));

  const upstream = await fetch(THEIRSTACK_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const contentType = upstream.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!upstream.ok) {
    const errorText = isJson
      ? JSON.stringify(await upstream.json())
      : await upstream.text();
    return new Response(
      JSON.stringify({ error: `TheirStack API error: ${errorText}` }),
      {
        status: upstream.status,
        headers: { "content-type": "application/json", ...CORS },
      }
    );
  }

  const apiResponse: TheirStackApiResponse = isJson
    ? await upstream.json()
    : {
        metadata: {
          total_results: null,
          total_companies: null,
          truncated_results: 0,
          truncated_companies: 0,
        },
        data: [],
      };

  // Transform TheirStack response to expected frontend format
  const transformedJobs = (apiResponse.data || []).map((job: TheirStackJob) => {
    // Build location array
    let locations: string[] = [];
    if (job.locations && job.locations.length > 0) {
      locations = job.locations.map((loc) => {
        if (loc.city && loc.state) {
          return `${loc.city}, ${loc.state}`;
        } else if (loc.city) {
          return loc.city;
        } else if (loc.name) {
          return loc.name;
        }
        return loc.country || "Unknown";
      });
    }

    // Add remote to locations if applicable
    // if (job.remote === true) {
    //   locations = ["Remote", ...locations];
    // }

    // Extract employment type from array
    const employmentType = job.employment_statuses?.[0] || "Unknown";

    // Calculate human readable posted date
    const postedDate = new Date(job.date_posted);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - postedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let postedHumanReadable = "";
    if (diffDays === 1) {
      postedHumanReadable = "1 day ago";
    } else if (diffDays <= 7) {
      postedHumanReadable = `${diffDays} days ago`;
    } else if (diffDays <= 30) {
      const weeks = Math.floor(diffDays / 7);
      postedHumanReadable = weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      postedHumanReadable =
        months === 1 ? "1 month ago" : `${months} months ago`;
    }

    return {
      id: job.id,
      organization: job.company_object?.name || "Unknown Company",
      title: job.job_title,
      date_posted: job.date_posted,
      locations_derived: locations,
      url: job.url,
      company_url: job.company_object?.domain
        ? `https://${job.company_object.domain}`
        : "",
      job_description: job.description || "",
      employment_type: employmentType,
      is_remote: job.remote === true,
      posted_human_readable: postedHumanReadable,
      salary_min: job.min_annual_salary_usd,
      salary_max: job.max_annual_salary_usd,
      salary_currency: "USD",
      raw: job,
    };
  });

  // Filter out jobs without company URLs if needed
  // check if company domain is not null
  const filteredJobs = transformedJobs.filter((job) => job.company_url);

  // Prepare response with pagination metadata
  const totalQueryResult = apiResponse.metadata?.total_results || 0;
  const responseData = {
    data: filteredJobs,
    metadata: {
      total_results: totalQueryResult,
      page: payload.page || 1,
      limit: payload.limit || DEFAULT_LIMIT,
      has_next_page:
        transformedJobs.length === (payload.limit || DEFAULT_LIMIT) &&
        (totalQueryResult
          ? (payload.page || 1) * (payload.limit || DEFAULT_LIMIT) <
            totalQueryResult
          : true),
    },
  };

  await logUsage(user, "jobs_searched", supabaseClient);

  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: {
      "content-type": "application/json",
      ...CORS,
    },
  });
}

Deno.serve(handleRequest);
