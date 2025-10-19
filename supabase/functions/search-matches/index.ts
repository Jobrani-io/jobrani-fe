import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ApolloPersonData } from "../../types/apollo.ts";
import { searchPeople } from "../../utils/apollo.ts";
import { generateHiringManagerTitlesOpenAi } from "../../utils/openai.ts";
import {
  checkIfUrl,
  extractAllHiringManagerTitlesFromHiringManagerTitles,
  formatApolloPeopleDataToMatch,
  sanitizeDomain,
} from "../../utils/sanitize.ts";
import { logUsage } from "../_shared/usage.ts";
import { companyHiringManagerTitlesGenerationPrompt } from "../../utils/prompts.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RequestBodySingleObject {
  job_id: string;
  user_id: string;
  company: string;
  job_title: string;
  location?: string;
}

export interface HiringManagerTitles {
  company: string;
  hiring_manager_title: string;
  backup_titles: string[];
}

type RequestBody = RequestBodySingleObject[];

export type ProspectMatch = {
  name: string;
  title: string;
  linkedin_url: string;
  confidence: number;
  reason: string;
};

interface SearchMatchesResponse {
  job_id: string;
  matches: ProspectMatch[];
  hiringManagerTitles: string[];
}

// Generate random hiring manager matches

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: CORS,
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...CORS },
    });
  }

  const supabase = createClient(
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
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json", ...CORS },
    });
  }

  try {
    const currentPage = 1;

    let response: SearchMatchesResponse[] = [];
    const body: RequestBody = await req.json();

    const sanitizedBody = body.map(({ company, ...rest }) => ({
      ...rest,
      company: sanitizeDomain(company),
    }));

    const companyWithApolloPeople: {
      company: string;
      apolloPeople: ApolloPersonData[];
    }[] = [];

    for (const { job_id, user_id, company, job_title } of sanitizedBody) {
      if (
        !job_id ||
        !user_id ||
        !company ||
        !checkIfUrl(company) ||
        !job_title
      ) {
        return new Response(
          JSON.stringify({
            error: "Missing required fields or company is not a valid url",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      response.push({
        job_id,
        matches: [],
        hiringManagerTitles: [],
      });
    }

    for (const { company, job_title, job_id, user_id } of sanitizedBody) {
      // maybe first try to check if job_title has data from prospect match? this way it is much easier?
      const { data: existingProspectMatch } = await supabase
        .from("prospect_matches")
        .select("matches")
        .eq("job_id", job_id)
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (existingProspectMatch && existingProspectMatch.length > 0) {
        response = response.map((eachResponse) => {
          if (eachResponse.job_id === job_id) {
            eachResponse.matches = existingProspectMatch[0].matches;
          }
          return eachResponse;
        });
      } else {
        const { data: apolloresponseForGivenBusinessForGivenUser } =
          // get only one data and latest one
          await supabase
            .from("apollo_responses")
            .select("raw_data")
            .eq("business_domain", company)
            .eq("job_title", job_title)
            .order("created_at", { ascending: false })
            .limit(1);

        if (apolloresponseForGivenBusinessForGivenUser?.[0]?.raw_data) {
          response = response.map((eachResponse) => {
            if (eachResponse.job_id === job_id) {
              eachResponse.matches = formatApolloPeopleDataToMatch([
                apolloresponseForGivenBusinessForGivenUser?.[0].raw_data,
              ]);
            }
            return eachResponse;
          });
        }
      }
    }

    console.log("response", response);

    const jobWithoutHiringManagers = sanitizedBody.filter(
      ({ job_id }) =>
        response.find(({ job_id: existingJobId }) => existingJobId === job_id)
          ?.matches.length === 0
    );

    if (jobWithoutHiringManagers.length === 0) {
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const formattedJsonInput = jobWithoutHiringManagers.map(
      ({ company, job_title, location }) => ({
        job_title,
        location,
        company,
      })
    );

    const { data: hiringManagerPrompt } = await supabase
      .from("hiring_manager_prompt")
      .select("prompt, model")
      .order("created_at", { ascending: false })
      .limit(1);

    const hiringManagerTitles = await generateHiringManagerTitlesOpenAi({
      formattedJsonInput,
      prompt:
        hiringManagerPrompt[0]?.prompt ??
        companyHiringManagerTitlesGenerationPrompt,
      model: hiringManagerPrompt[0]?.model ?? "gpt-4.1",
    });

    const allHiringManagerTitlesString =
      extractAllHiringManagerTitlesFromHiringManagerTitles(hiringManagerTitles);

    const apolloResponse = await searchPeople({
      person_titles: allHiringManagerTitlesString,
      q_organization_domains_list: sanitizedBody.map(({ company }) => company),
      per_page: 100,
      page: currentPage,
    });

    for (const { company } of sanitizedBody) {
      console.log("company", company);
      companyWithApolloPeople.push({
        company,
        apolloPeople: apolloResponse.people.filter(
          ({ organization }) =>
            sanitizeDomain(organization?.website_url ?? "") === company ||
            organization?.name.toLowerCase() === company.toLowerCase()
        ),
      });
    }

    const companiesWithoutHiringManagers = sanitizedBody.filter(
      ({ company: companyBody }) =>
        !companyWithApolloPeople.find(({ company }) => company === companyBody)
    );

    if (
      companiesWithoutHiringManagers.length > 0 &&
      apolloResponse.pagination.total_pages > currentPage
    ) {
      const titlesForCompaniesWithoutHiringManagers =
        companiesWithoutHiringManagers
          .map(({ company }) => [
            hiringManagerTitles.find(
              ({ company: companyWithHiringManagerTitle }) =>
                companyWithHiringManagerTitle === company
            )?.hiring_manager_title ?? "",
            ...(hiringManagerTitles.find(
              ({ company: companyWithHiringManagerTitle }) =>
                companyWithHiringManagerTitle === company
            )?.backup_titles ?? []),
          ])
          .flat()
          .filter((title) => Boolean(title));

      // search apollo with backup titles
      const apolloResponseForSecondPage = await searchPeople({
        person_titles: titlesForCompaniesWithoutHiringManagers,
        q_organization_domains_list: companiesWithoutHiringManagers.map(
          ({ company }) => company
        ),
        per_page: 100,
        page: currentPage + 1,
      });

      for (const { company } of companiesWithoutHiringManagers) {
        companyWithApolloPeople.push({
          company,
          apolloPeople: apolloResponseForSecondPage.people.filter(
            ({ organization }) =>
              sanitizeDomain(organization.primary_domain ?? "") === company ||
              organization.name.toLowerCase() === company.toLowerCase()
          ),
        });
      }
    }

    for (const { apolloPeople } of companyWithApolloPeople) {
      for (const people of apolloPeople) {
        const requestJobTitle = sanitizedBody.find(
          ({ company }) =>
            company === sanitizeDomain(people.organization.primary_domain ?? "")
        )?.job_title;

        await supabase.from("apollo_responses").insert({
          business_name: people.organization.name.toLowerCase(),
          business_domain: sanitizeDomain(
            people.organization.primary_domain ?? ""
          ),
          raw_data: people,
          job_title: people.title,
        });
      }
    }
    // now we need to send the prospect matches - only for jobs that don't already have matches
    for (const body of sanitizedBody) {
      // Check if this job already has matches in the response
      const existingResponse = response.find(
        ({ job_id }) => job_id === body.job_id
      );

      // Only insert if there are no existing matches
      if (!existingResponse || existingResponse.matches.length === 0) {
        const correspondingHiringManagerTitles = hiringManagerTitles.find(
          ({ company: companyWithHiringManagerTitle }) =>
            companyWithHiringManagerTitle === body.company
        );
        const hiringManagerTitlesArray = correspondingHiringManagerTitles
          ? [
              correspondingHiringManagerTitles.hiring_manager_title,
              ...correspondingHiringManagerTitles.backup_titles,
            ]
          : [];

        const { error: prospectMatchesError, data: prospectMatchesData } =
          await supabase
            .from("prospect_matches")
            .upsert(
              {
                job_id: body.job_id,
                user_id: body.user_id,
                matches: formatApolloPeopleDataToMatch(
                  companyWithApolloPeople.find(
                    ({ company: companyWithApolloPeopleCompany }) =>
                      companyWithApolloPeopleCompany === body.company
                  )?.apolloPeople ?? []
                ),
                hiring_manager_titles: hiringManagerTitlesArray,
              },
              {
                onConflict: "user_id, job_id",
              }
            )
            .select();

        if (prospectMatchesError) {
          console.error("Error saving prospect matches:", prospectMatchesError);
        } else if (prospectMatchesData && prospectMatchesData.length > 0) {
          // Update the response with the newly inserted matches
          const responseIndex = response.findIndex(
            ({ job_id }) => job_id === body.job_id
          );
          if (responseIndex !== -1) {
            response[responseIndex].matches = prospectMatchesData[0].matches;
            const correspondingHiringManagerTitles = hiringManagerTitles.find(
              ({ company: companyWithHiringManagerTitle }) =>
                companyWithHiringManagerTitle === body.company
            );
            if (correspondingHiringManagerTitles) {
              response[responseIndex].hiringManagerTitles = [
                correspondingHiringManagerTitles.hiring_manager_title,
                ...correspondingHiringManagerTitles.backup_titles,
              ];
            }
          }
        }
      }
    }

    await logUsage(user, "prospects_found", supabase);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
