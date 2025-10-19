import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.53.0";
import { OpenAI } from "npm:openai";
import {
  DAILY_MESSAGE_LIMIT,
  DEFAULT_OPENAI_MODEL,
  MESSAGE_GENERATION_BATCH_SIZE,
} from "../../utils/constant.ts";
import { logUsage } from "../_shared/usage.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SavedProspect {
  prospect_id: string;
  company: string;
  job_title: string;
  location?: string;
  posted_on?: string;
  url?: string;
  user_id: string;
}

interface Challenge {
  id: string;
  text: string;
  why_relevant: string;
}

interface GeneratedMessage {
  prospect: {
    prospect_id: string;
    company: string;
    job_title: string;
  };
  match: {
    first_name: string;
    last_name: string;
    title: string;
  };
  messageContent: string;
  messageSubject: string;
  messageId: string;
}

interface PreferredMatch {
  job_id: string;
  selected_match: any;
}

// Helper function to generate messages for a batch of prospects
async function generateMessagesForBatch({
  savedProspects,
  preferredMatches,
  candidateHighlights,
  mentionJobInMessages,
  customInstructions,
  supabase,
  userId,
}: {
  savedProspects: SavedProspect[];
  preferredMatches: PreferredMatch[];
  candidateHighlights: string;
  mentionJobInMessages: boolean;
  customInstructions: string | null;
  supabase: SupabaseClient;
  userId: string;
}): Promise<GeneratedMessage[]> {
  // Prepare data for all prospects in the batch
  const today = new Date().toISOString().split("T")[0];
  const batchInputs: {
    company_name: string;
    job_title: string;
    location: string;
    recipient_name: string;
    challenges: Challenge[];
  }[] = [];
  const prospectData: SavedProspect[] = [];

  for (const savedProspect of savedProspects) {
    // Find the preferred match for this prospect from the passed data
    const preferredMatch = preferredMatches.find(
      (pm) => pm.job_id === savedProspect.prospect_id
    );
    const selectedMatch = preferredMatch?.selected_match;

    if (!selectedMatch?.name) {
      console.error(
        `No preferred match found for prospect ${savedProspect.prospect_id}`
      );
      continue;
    }

    // Get challenges for this prospect
    const { data: challenges } = await supabase
      .from("prospect_challenges")
      .select("*")
      .eq("user_id", userId)
      .eq("prospect_id", savedProspect.prospect_id);

    if (!challenges || challenges.length === 0) {
      throw new Error(
        `No challenges found for prospect ${savedProspect.prospect_id}`
      );
    }

    // Prepare input for this prospect
    const prospectInput = {
      company_name: savedProspect.company,
      job_title: savedProspect.job_title,
      location: savedProspect.location ?? "",
      recipient_name: selectedMatch.name.split(" ")?.[0] || "",
      challenges: challenges.map(
        (c: { id: string; text: string; why_relevant: string }) => ({
          id: c.id,
          text: c.text,
          why_relevant: c.why_relevant,
        })
      ),
    };

    batchInputs.push(prospectInput);
    prospectData.push(savedProspect);
  }

  if (batchInputs.length === 0) {
    return [];
  }

  const aiConfig = {
    prompt: "",
    model: DEFAULT_OPENAI_MODEL,
    temperature: 0.5,
  };

  if (mentionJobInMessages) {
    // get the first one
    const { data: messagePrompt } = await supabase
      .from("message_prompt")
      .select()
      .eq("type", "job_mention")
      .order("created_at", { ascending: false })
      .limit(1);
    aiConfig.prompt = messagePrompt[0]?.prompt;
    aiConfig.model = messagePrompt[0]?.model;
    aiConfig.temperature = parseFloat(messagePrompt[0]?.temperature);
  } else {
    const { data: messagePrompt } = await supabase
      .from("message_prompt")
      .select()
      .eq("type", "no_job_mention")
      .order("created_at", { ascending: false })
      .limit(1);

    aiConfig.prompt = messagePrompt[0]?.prompt;
    aiConfig.model = messagePrompt[0]?.model;
    aiConfig.temperature = parseFloat(messagePrompt[0]?.temperature);
  }

  // Create the user prompt with batch inputs and highlights
  const userPrompt =
    JSON.stringify(batchInputs) + "\n\nHighlights:\n" + candidateHighlights;

  const finalPrompt = customInstructions
    ? `${aiConfig.prompt}\n\nAdditional Instructions: ${customInstructions}`
    : aiConfig.prompt;

  // Generate messages using OpenAI
  const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openAIApiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const openai = new OpenAI({ apiKey: openAIApiKey });
  const openAIResponse = await openai.responses.create({
    model: aiConfig.model,
    input: [
      { role: "system", content: finalPrompt },
      { role: "user", content: userPrompt },
    ],
    // temperature: aiConfig.temperature,
  });

  const responseContent = openAIResponse.output_text;

  let messageDetail: {
    subject: string;
    message: string;
    selected_highlight: string;
    selected_challenge: string;
  }[] = [];

  try {
    messageDetail = JSON.parse(responseContent || "[]");
  } catch (error) {
    console.error(`Failed to parse OpenAI response: ${error.message}`);
    return [];
  }

  // Save all generated messages
  const results: GeneratedMessage[] = [];
  for (let i = 0; i < savedProspects.length; i++) {
    // Check if message already exists before inserting
    const { data: existingMessage } = await supabase
      .from("generated_messages")
      .select("id")
      .eq("user_id", userId)
      .eq("prospect_id", savedProspects[i].prospect_id)
      .eq("custom_instructions", customInstructions ?? "")
      .eq("generation_date", today)
      .limit(1);

    let messageData;

    if (existingMessage && existingMessage.length > 0) {
      // Message already exists, use existing one
      const { data: fullMessage } = await supabase
        .from("generated_messages")
        .select("*")
        .eq("id", existingMessage[0].id)
        .single();
      messageData = fullMessage;
    } else {
      // Insert new message
      const { data: newMessage, error: messageError } = await supabase
        .from("generated_messages")
        .insert({
          user_id: userId,
          prospect_id: savedProspects[i].prospect_id,
          message_content: messageDetail[i].message,
          custom_instructions: customInstructions ?? "",
          generation_date: today,
          detail: messageDetail[i],
          approved: false, // New messages start as unapproved
        })
        .select()
        .single();

      if (messageError) {
        throw new Error(`Failed to save message: ${messageError.message}`);
      }
      messageData = newMessage;
    }

    // Find the preferred match for this prospect
    const preferredMatch = preferredMatches.find(
      (pm) => pm.job_id === savedProspects[i].prospect_id
    );
    const selectedMatch = preferredMatch?.selected_match;

    results.push({
      prospect: {
        prospect_id: savedProspects[i].prospect_id,
        company: savedProspects[i].company,
        job_title: savedProspects[i].job_title,
      },
      match: {
        first_name: selectedMatch?.name?.split(" ")[0] || "",
        last_name: selectedMatch?.name?.split(" ").slice(1).join(" ") || "",
        title: selectedMatch?.title || "",
      },
      messageContent: messageDetail[i].message || "",
      messageSubject: messageDetail[i].subject || "",
      messageId: messageData.id,
    });
  }

  return results;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      customInstructions = null,
      mentionJobInMessages = true,
      prospectIds = [], // Array of specific prospect IDs to generate for
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
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const { data: userResume, error: resumeError } = await supabase
      .from("user_resumes")
      .select("highlights")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (resumeError || !userResume?.highlights) {
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

    const candidateHighlights = userResume.highlights;

    // Get preferred matches (filter by prospectIds if provided)
    let preferredMatchesQuery = supabase
      .from("preferred_matches")
      .select(
        `
        id,
        job_id,
        selected_match`
      )
      .eq("user_id", user.id)
      .not("selected_match", "is", null);

    if (prospectIds && prospectIds.length > 0) {
      preferredMatchesQuery = preferredMatchesQuery.in("job_id", prospectIds);
    }

    const { data: preferredMatches, error: preferredMatchesError } =
      await preferredMatchesQuery;

    if (
      preferredMatchesError ||
      !preferredMatches ||
      preferredMatches.length === 0
    ) {
      return new Response(
        JSON.stringify({
          error:
            "No preferred matches found. Please set up preferred matches in the Match module first.",
          preferredMatches,
          preferredMatchesError,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const uniqueJobIds = [...new Set(preferredMatches.map((pm) => pm.job_id))];

    const { data: savedProspectsData } = await supabase
      .from("saved_prospects")
      .select("*")
      .eq("user_id", user.id)
      .in("prospect_id", uniqueJobIds);

    // Transform preferred matches to SavedProspect format for compatibility
    const savedProspects: SavedProspect[] = savedProspectsData.map(
      (savedProspect) => ({
        prospect_id: savedProspect.prospect_id,
        company: savedProspect.company,
        job_title: savedProspect.job_title,
        location: savedProspect.location,
        posted_on: savedProspect.posted_on,
        url: savedProspect.url,
        user_id: savedProspect.user_id,
      })
    );

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const generatedMessages: GeneratedMessage[] = [];

        let messageGenerationCount = 0;
        const remainingQuota = DAILY_MESSAGE_LIMIT - currentCount;
        const prospectsNeedingGeneration: SavedProspect[] = [];

        // Remove duplicates by prospect_id to prevent duplicate messages
        const uniqueProspects = savedProspects.filter(
          (prospect, index, arr) =>
            arr.findIndex((p) => p.prospect_id === prospect.prospect_id) ===
            index
        );

        console.log(
          `Filtered ${savedProspects.length} prospects to ${uniqueProspects.length} unique prospects`
        );

        // Stream initial status
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "status",
              total: uniqueProspects.length,
              remaining: uniqueProspects.length,
              generated: 0,
            })}\n\n`
          )
        );

        // First pass: collect cached messages and prospects needing generation
        for (const savedProspect of uniqueProspects) {
          // Check for existing messages with the same custom instructions and generation parameters
          const { data: existingGeneratedMessage } = await supabase
            .from("generated_messages")
            .select("*")
            .eq("user_id", user.id)
            .eq("prospect_id", savedProspect.prospect_id)
            .eq("custom_instructions", customInstructions ?? "")
            .eq("generation_date", today)
            .order("created_at", { ascending: false })
            .limit(1);

          if (
            existingGeneratedMessage &&
            existingGeneratedMessage?.length > 0
          ) {
            // Find the preferred match for this prospect
            const preferredMatch = preferredMatches.find(
              (pm) => pm.job_id === savedProspect.prospect_id
            );
            const selectedMatch = preferredMatch?.selected_match;

            const messageData = {
              prospect: {
                prospect_id: savedProspect.prospect_id,
                company: savedProspect.company,
                job_title: savedProspect.job_title,
              },
              match: {
                first_name: selectedMatch?.name?.split(" ")[0] || "",
                last_name:
                  selectedMatch?.name?.split(" ").slice(1).join(" ") || "",
                title: selectedMatch?.title || "",
              },
              messageContent: existingGeneratedMessage?.[0].message_content,
              messageId: existingGeneratedMessage?.[0].id,
              messageSubject: existingGeneratedMessage?.[0].detail?.subject,
            };
            generatedMessages.push(messageData);

            // Stream cached message
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "message",
                  ...messageData,
                  cached: true,
                })}\n\n`
              )
            );
            console.log(
              `Found cached message for ${savedProspect.company} with matching parameters`
            );
          } else {
            prospectsNeedingGeneration.push(savedProspect);
          }
        }

        const prospectsToGenerate = prospectsNeedingGeneration.slice(
          0,
          Math.min(remainingQuota, prospectsNeedingGeneration.length)
        );

        console.log(
          `Found ${generatedMessages.length} cached messages, generating ${prospectsToGenerate.length} new messages`
        );

        for (
          let i = 0;
          i < prospectsToGenerate.length;
          i += MESSAGE_GENERATION_BATCH_SIZE
        ) {
          const batch = prospectsToGenerate.slice(
            i,
            i + MESSAGE_GENERATION_BATCH_SIZE
          );

          // Update remaining count
          const remaining = prospectsToGenerate.length - i;
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "status",
                total: uniqueProspects.length,
                remaining: remaining,
                generated: generatedMessages.length + messageGenerationCount,
                processed: i,
              })}\n\n`
            )
          );

          try {
            // Process batch together using OpenAI
            const batchResults = await generateMessagesForBatch({
              savedProspects: batch,
              preferredMatches,
              candidateHighlights,
              mentionJobInMessages,
              customInstructions,
              supabase,
              userId: user.id,
            });

            // Stream results as they complete
            for (const result of batchResults) {
              generatedMessages.push(result);
              messageGenerationCount++;

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "message",
                    ...result,
                    cached: false,
                  })}\n\n`
                )
              );
            }

            // Update status after batch completion
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "status",
                  total: uniqueProspects.length,
                  remaining: Math.min(
                    prospectsToGenerate.length -
                      (i + MESSAGE_GENERATION_BATCH_SIZE),
                    0
                  ),
                  generated: generatedMessages.length,
                  processed: Math.min(
                    i + MESSAGE_GENERATION_BATCH_SIZE,
                    prospectsToGenerate.length
                  ),
                })}\n\n`
              )
            );
          } catch (error) {
            console.error(`Error generating batch for prospects:`, error);
            // Handle error for the batch - you could retry individual prospects here if needed
          }
        }

        // Update daily generation limits
        const newCount = currentCount + messageGenerationCount;

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
            messages_generated: messageGenerationCount,
          });
        }

        await logUsage(
          user,
          "messages_generated",
          supabase,
          messageGenerationCount
        );

        // Stream final completion
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "complete",
              total: uniqueProspects.length,
              generated: generatedMessages.length,
              newMessagesGenerated: messageGenerationCount,
              dailyStats: {
                used: newCount,
                limit: DAILY_MESSAGE_LIMIT,
                remaining: DAILY_MESSAGE_LIMIT - newCount,
              },
            })}\n\n`
          )
        );

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in generate-messages function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
