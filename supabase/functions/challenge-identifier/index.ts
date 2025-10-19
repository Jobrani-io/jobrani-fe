import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DEFAULT_OPENAI_MODEL } from "../../utils/constant.ts";
import { companyChallengeIdentifierPrompt } from "../../utils/prompts.ts";
import OpenAI from "npm:openai";

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

export type ProspectMatch = {
  name: string;
  title: string;
  linkedin_url: string;
  confidence: number;
  reason: string;
};

interface ParsedChallengeResponse {
  results: {
    prospect_id: string;
    challenges: {
      id: string;
      text: string;
      why_relevant: string;
    }[];
  }[];
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
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
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
    const { data: prospectChallenges, error } = await supabase
      .from("prospect_challenges")
      .select("*")
      .eq("user_id", user.id);

    const existingProspectChallenges = prospectChallenges.map(
      (prospectChallenge) => prospectChallenge.prospect_id
    );
    
    console.log('Existing prospect challenges:', existingProspectChallenges);

    let query = supabase
      .from("saved_prospects")
      .select("*")
      .eq("user_id", user.id);

    if (existingProspectChallenges.length > 0) {
      query = query.not(
        "prospect_id",
        "in",
        existingProspectChallenges
      );
    }

    const { data: savedProspects, error: savedProspectsError } = await query;

    console.log('Saved prospects:', savedProspects);

    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    });

    const prospectInput = savedProspects.map((prospect) => ({
      prospect_id: prospect.prospect_id,
      company_name: prospect.company,
      job_title: prospect.job_title,
      location: prospect.location,
    }));

    if (prospectInput.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          data: [],
          error: "No prospects to identify challenges for",
        }),
        {
          headers: { "Content-Type": "application/json", ...CORS },
        }
      );
    }

    const openaiResponse = await openai.responses.create({
      model: DEFAULT_OPENAI_MODEL,
      input: [
        {
          role: "system",
          content: companyChallengeIdentifierPrompt,
        },
        {
          role: "user",
          content: JSON.stringify(prospectInput),
        },
      ],
    });

    const jsonResponse = openaiResponse.output_text
      .replace(/```json/g, "")
      .replace(/```/g, "");

    const parsedResponse: ParsedChallengeResponse = JSON.parse(
      jsonResponse
    ) as ParsedChallengeResponse;

    const { data: prospectChallengesResult, error: prospectChallengesError } =
      await supabase.from("prospect_challenges").insert(
        parsedResponse.results.map((result) => ({
          prospect_id: result.prospect_id,
          challenges: result.challenges,
          user_id: user.id,
          job_title: prospectInput.find(
            (prospect) => prospect.prospect_id === result.prospect_id
          )?.job_title,
        }))
      );

    return new Response(
      JSON.stringify({
        success: true,
        prospectChallengesResult,
        prospectChallengesError,
        parsedResponse,
      }),
      {
        headers: { "Content-Type": "application/json", ...CORS },
      }
    );

    // now for this prospect, we have to to identity challenge using openai
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
