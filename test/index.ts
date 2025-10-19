import fs from "fs";

const API_KEY = "mVgcqwpbOVYobYArlmvSeQ";

// Apollo.io People Search API Types
interface PersonSearchParams {
  person_titles?: string[];
  include_similar_titles?: boolean;
  q_keywords?: string;
  person_locations?: string[];
  person_seniorities?: string[];
  organization_locations?: string[];
  q_organization_domains_list?: string[];
  contact_email_status?: string[];
  organization_ids?: string[];
  organization_num_employees_ranges?: string[];
  revenue_range?: {
    min?: number;
    max?: number;
  };
  currently_using_all_of_technology_uids?: string[];
  currently_using_any_of_technology_uids?: string[];
  currently_not_using_any_of_technology_uids?: string[];
  q_organization_job_titles?: string[];
  organization_job_locations?: string[];
  organization_num_jobs_range?: {
    min?: number;
    max?: number;
  };
  organization_job_posted_at_range?: {
    min?: string;
    max?: string;
  };
  page?: number;
  per_page?: number;
}

interface PersonSearchResponse {
  people: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  pagination: {
    page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  };
}

// Apollo.io People Search Function
async function searchPeople(
  params: PersonSearchParams
): Promise<PersonSearchResponse> {
  const baseUrl = "https://api.apollo.io/api/v1/mixed_people/search";

  // Build query parameters
  const queryParams = new URLSearchParams();

  // Handle array parameters
  if (params.person_titles) {
    params.person_titles.forEach((title) =>
      queryParams.append("person_titles[]", title)
    );
  }

  if (params.person_locations) {
    params.person_locations.forEach((location) =>
      queryParams.append("person_locations[]", location)
    );
  }

  if (params.person_seniorities) {
    params.person_seniorities.forEach((seniority) =>
      queryParams.append("person_seniorities[]", seniority)
    );
  }

  if (params.organization_locations) {
    params.organization_locations.forEach((location) =>
      queryParams.append("organization_locations[]", location)
    );
  }

  if (params.q_organization_domains_list) {
    params.q_organization_domains_list.forEach((domain) =>
      queryParams.append("q_organization_domains_list[]", domain)
    );
  }

  if (params.contact_email_status) {
    params.contact_email_status.forEach((status) =>
      queryParams.append("contact_email_status[]", status)
    );
  }

  if (params.organization_ids) {
    params.organization_ids.forEach((id) =>
      queryParams.append("organization_ids[]", id)
    );
  }

  if (params.organization_num_employees_ranges) {
    params.organization_num_employees_ranges.forEach((range) =>
      queryParams.append("organization_num_employees_ranges[]", range)
    );
  }

  if (params.currently_using_all_of_technology_uids) {
    params.currently_using_all_of_technology_uids.forEach((tech) =>
      queryParams.append("currently_using_all_of_technology_uids[]", tech)
    );
  }

  if (params.currently_using_any_of_technology_uids) {
    params.currently_using_any_of_technology_uids.forEach((tech) =>
      queryParams.append("currently_using_any_of_technology_uids[]", tech)
    );
  }

  if (params.currently_not_using_any_of_technology_uids) {
    params.currently_not_using_any_of_technology_uids.forEach((tech) =>
      queryParams.append("currently_not_using_any_of_technology_uids[]", tech)
    );
  }

  if (params.q_organization_job_titles) {
    params.q_organization_job_titles.forEach((title) =>
      queryParams.append("q_organization_job_titles[]", title)
    );
  }

  if (params.organization_job_locations) {
    params.organization_job_locations.forEach((location) =>
      queryParams.append("organization_job_locations[]", location)
    );
  }

  // Handle boolean parameters
  if (params.include_similar_titles !== undefined) {
    queryParams.append(
      "include_similar_titles",
      params.include_similar_titles.toString()
    );
  }

  // Handle string parameters
  if (params.q_keywords) {
    queryParams.append("q_keywords", params.q_keywords);
  }

  // Handle number parameters
  if (params.page) {
    queryParams.append("page", params.page.toString());
  }

  if (params.per_page) {
    queryParams.append("per_page", params.per_page.toString());
  }

  // Handle revenue range
  if (params.revenue_range?.min) {
    queryParams.append(
      "revenue_range[min]",
      params.revenue_range.min.toString()
    );
  }

  if (params.revenue_range?.max) {
    queryParams.append(
      "revenue_range[max]",
      params.revenue_range.max.toString()
    );
  }

  // Handle organization job range
  if (params.organization_num_jobs_range?.min) {
    queryParams.append(
      "organization_num_jobs_range[min]",
      params.organization_num_jobs_range.min.toString()
    );
  }

  if (params.organization_num_jobs_range?.max) {
    queryParams.append(
      "organization_num_jobs_range[max]",
      params.organization_num_jobs_range.max.toString()
    );
  }

  // Handle job posted date range
  if (params.organization_job_posted_at_range?.min) {
    queryParams.append(
      "organization_job_posted_at_range[min]",
      params.organization_job_posted_at_range.min
    );
  }

  if (params.organization_job_posted_at_range?.max) {
    queryParams.append(
      "organization_job_posted_at_range[max]",
      params.organization_job_posted_at_range.max
    );
  }

  const url = `${baseUrl}?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "X-Api-Key": API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const responseHeaders = response.headers;
    return {
      ...data,
      headers: Object.fromEntries(responseHeaders.entries()),
    };
  } catch (error) {
    console.error("Error searching people:", error);
    throw error;
  }
}

// Example usage function
async function exampleUsage() {
  try {
    const searchResults = await searchPeople({
      person_titles: ["hiring manager", "cmo", "ceo", "vp of marketing"],
      person_seniorities: [],
      person_locations: [],
      organization_locations: ["United States"],
      q_organization_domains_list: [
        "dashlane.com",
        "perplexity.ai",
        "stripe.com",
        "airbnb.com",
      ],
      organization_num_employees_ranges: [],
      page: 1,
      per_page: 100,
      include_similar_titles: true,
    });

    fs.writeFileSync(
      "searchResults.json",
      JSON.stringify(searchResults, null, 2)
    );
  } catch (error) {
    console.error("Search failed:", error);
  }
}

exampleUsage();
