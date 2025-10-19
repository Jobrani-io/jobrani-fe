import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";
import { OpenAI } from "npm:openai";
import { generateMessagesPrompt } from "../../utils/prompts.ts";
import { DAILY_MESSAGE_LIMIT } from "../../utils/constant.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      customInstructions = "",
      messageIds = [],
      mentionJob = true,
      profileHighlights = [],
    } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Generating messages for user:", user.id);

    // Check daily generation limits
    const today = new Date().toISOString().split("T")[0];

    const { data: dailyLimit } = await supabase
      .from("daily_generation_limits")
      .select("messages_generated")
      .eq("user_id", user.id)
      .eq("generation_date", today)
      .single();

    const currentCount = dailyLimit?.messages_generated || 0;

    if (currentCount >= DAILY_MESSAGE_LIMIT) {
      return new Response(
        JSON.stringify({
          error: "Daily message generation limit reached",
          limit: DAILY_MESSAGE_LIMIT,
          remaining: 0,
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if profile highlights are provided
    if (!profileHighlights || profileHighlights.length === 0) {
      return new Response(
        JSON.stringify({
          error:
            "No profile highlights found. Please complete your profile in the Design module first.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: generatedMessages, error: generatedMessagesError } =
      await supabase
        .from("generated_messages")
        .select("*")
        .eq("user_id", user.id)
        .in("id", messageIds);

    const prospectIdToMessageIdMap = generatedMessages?.reduce(
      (acc, message: { prospect_id: string; id: string }) => {
        acc[message.prospect_id] = message.id;
        return acc;
      },
      {} as Record<string, string>
    );

    const associatedApprovedProspects = Object.keys(prospectIdToMessageIdMap);

    const { data: prospects, error: prospectsError } = await supabase
      .from("saved_prospects")
      .select("*")
      .eq("user_id", user.id)
      .in("prospect_id", associatedApprovedProspects);

    const savedProspectsIds =
      prospects?.map((prospect) => prospect.prospect_id) || [];

    const { data: preferredMatches } = await supabase
      .from("preferred_matches")
      .select("*")
      .eq("user_id", user.id)
      .in("job_id", savedProspectsIds);

    if (
      prospectsError ||
      !prospects ||
      prospects.length === 0 ||
      generatedMessagesError ||
      !generatedMessages ||
      generatedMessages.length === 0
    ) {
      return new Response(
        JSON.stringify({
          error:
            "No saved prospects or generated messages found. Please save some prospects in the Match module first and generate some messages first.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate messages using OpenAI
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const updatedGeneratedMessages: {
      prospect: any;
      message: string;
      messageId: string;
    }[] = [];

    const messageIdsToUpdate = Object.values(prospectIdToMessageIdMap);

    console.log("Message IDs to update:", messageIdsToUpdate);

    for (const prospectId of associatedApprovedProspects) {
      const messageId = prospectIdToMessageIdMap[prospectId];
      const savedProspect = prospects?.find(
        (prospect) => prospect.prospect_id === prospectId
      );

      const preferredMatch = preferredMatches?.find(
        (match) => match.job_id === prospectId
      );
      const selectedMatch = preferredMatch?.selected_match;

      if (!selectedMatch?.name || !savedProspect || !savedProspect?.company_url)
        continue;

      const systemPrompt = `${generateMessagesPrompt}

Profile Highlights:
${profileHighlights
  .map((highlight, index) => `${index + 1}. ${highlight}`)
  .join("\n")}

${customInstructions ? `Additional Instructions: ${customInstructions}` : ""}`;

      const userPrompt = `Write a LinkedIn connection request message to:
Name: ${selectedMatch.name}
Title: ${savedProspect.job_title}
Company: ${savedProspect.company}
${mentionJob ? `Job Description: ${savedProspect.job_description}` : ""}


You are rewriting the message, here is the original message:
${
  generatedMessages.find((message) => message.id === messageId)?.message_content
}

Use the profile highlights provided in the system message to create a personalized message that would encourage them to accept the connection request. Start your letter with the greeting and no other text`;

      try {
        const openai = new OpenAI({
          apiKey: openAIApiKey,
        });

        const openAIResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 300,
          temperature: 0.7,
        });

        const messageContent = openAIResponse.choices[0].message.content;

        console.log({
          messageContent,
          systemPrompt,
        });

        const { data: messageData, error: messageError } = await supabase
          .from("generated_messages")
          .update({
            message_content: messageContent,
            custom_instructions: customInstructions,
            generation_date: today,
          })
          .eq("id", messageId)
          .select()
          .single();

        if (!messageError) {
          updatedGeneratedMessages.push({
            prospect: savedProspect,
            message: messageContent,
            messageId: messageData.id,
          });
          console.log(`Generated message for ${savedProspect.name}`);
        }
      } catch (error) {
        console.error(
          `Error generating message for prospect ${savedProspect.name}:`,
          error
        );
        continue;
      }
    }

    // Update daily generation limits
    const newCount = currentCount + updatedGeneratedMessages.length;

    if (dailyLimit) {
      await supabase
        .from("daily_generation_limits")
        .update({
          messages_generated: newCount,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("generation_date", today);
    } else {
      await supabase.from("daily_generation_limits").insert({
        user_id: user.id,
        generation_date: today,
        messages_generated: updatedGeneratedMessages.length,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        messages: updatedGeneratedMessages,
        dailyStats: {
          used: newCount,
          limit: DAILY_MESSAGE_LIMIT,
          remaining: DAILY_MESSAGE_LIMIT - newCount,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-messages function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
