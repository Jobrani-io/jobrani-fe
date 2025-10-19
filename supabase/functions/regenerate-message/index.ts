import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.53.0";
import { OpenAI } from "npm:openai";
import {
  DEFAULT_OPENAI_MODEL,
  MESSAGE_GENERATION_BATCH_SIZE,
} from "../../utils/constant.ts";
import { logUsage } from "../_shared/usage.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DAILY_MESSAGE_LIMIT = 10;

interface SavedProspect {
  prospect_id: string;
  company: string;
  job_title: string;
  location?: string;
  posted_on?: string;
  url?: string;
  user_id: string;
}

interface PreferredMatch {
  job_id: string;
  selected_match: any;
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

interface RegenerateRequest {
  autoGenerate: boolean;
  feedback?: string;
  messageIds: string[];
  mentionJobInMessages?: boolean;
  customInstructions?: string;
}

// Helper function to regenerate messages for a batch of selected messages
async function regenerateMessagesForBatch({
  selectedMessages,
  candidateHighlights,
  mentionJobInMessages,
  customInstructions,
  feedback,
  autoGenerate,
  supabase,
  userId,
}: {
  selectedMessages: { prospect_id: string; id: string }[];
  candidateHighlights: string;
  mentionJobInMessages: boolean;
  customInstructions: string | null;
  feedback: string;
  autoGenerate: boolean;
  supabase: SupabaseClient;
  userId: string;
}): Promise<GeneratedMessage[]> {
  const today = new Date().toISOString().split("T")[0];
  const batchInputs: {
    company_name: string;
    job_title: string;
    location: string;
    recipient_name: string;
    challenges: Challenge[];
  }[] = [];
  const messageData: { savedProspect: SavedProspect; messageId: string }[] = [];

  // Process highlights for auto-regenerate
  let highlightsToUse = candidateHighlights;
  if (autoGenerate) {
    // Highlights are stored as newline-separated text, not JSON
    const highlightsArray = candidateHighlights
      .split("\n")
      .filter((h) => h.trim());
    if (highlightsArray.length > 1) {
      const randomIndex = Math.floor(Math.random() * highlightsArray.length);
      highlightsToUse = highlightsArray[randomIndex];
    }
  }

  console.log("SELECTED MESSAGES====", selectedMessages);

  // Prepare data for all selected messages
  for (const message of selectedMessages) {
    // Get the saved prospect for this message
    const { data: savedProspect, error: prospectError } = await supabase
      .from("saved_prospects")
      .select("*")
      .eq("user_id", userId)
      .eq("prospect_id", message.prospect_id)
      .single();

    if (prospectError || !savedProspect) {
      console.error(`No saved prospect found for message ${message.id}`);
      continue;
    }

    // Get preferred match for this prospect
    const { data: preferredMatches } = await supabase
      .from("preferred_matches")
      .select(
        `
        id,
        job_id,
        selected_match`
      )
      .eq("user_id", userId)
      .eq("job_id", savedProspect.prospect_id)
      .not("selected_match", "is", null);

    const preferredMatch = preferredMatches?.[0];
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

    // For auto-regenerate, select a new challenge if more than 1 available
    let selectedChallenges = challenges;

    if (autoGenerate) {
      // Select a different challenge if more than one available
      if (challenges.length > 1) {
        const randomIndex = Math.floor(Math.random() * challenges.length);
        selectedChallenges = [challenges[randomIndex]];
      }
    }

    // Prepare input for this prospect
    const prospectInput = {
      company_name: savedProspect.company,
      job_title: savedProspect.job_title,
      location: savedProspect.location ?? "",
      recipient_name: selectedMatch.name,
      challenges: selectedChallenges.map(
        (c: { id: string; text: string; why_relevant: string }) => ({
          id: c.id,
          text: c.text,
          why_relevant: c.why_relevant,
        })
      ),
    };

    batchInputs.push(prospectInput);
    messageData.push({ savedProspect, messageId: message.id });
  }

  if (batchInputs.length === 0) {
    return [];
  }

  const aiConfig = {
    prompt: "",
    model: DEFAULT_OPENAI_MODEL,
    temperature: 0.5,
  };

  // Choose the appropriate prompt based on job mention setting
  if (mentionJobInMessages) {
    const { data: messagePrompt } = await supabase
      .from("message_prompt")
      .select()
      .eq("type", "job_mention")
      .limit(1)
      .order("created_at", { ascending: false });
    aiConfig.prompt = messagePrompt[0]?.prompt;
    aiConfig.model = messagePrompt[0]?.model;
    aiConfig.temperature = parseFloat(messagePrompt[0]?.temperature);
  } else {
    const { data: messagePrompt } = await supabase
      .from("message_prompt")
      .select()
      .eq("type", "no_job_mention")
      .limit(1)
      .order("created_at", { ascending: false });

    aiConfig.prompt = messagePrompt[0]?.prompt;
    aiConfig.model = messagePrompt[0]?.model;
    aiConfig.temperature = parseFloat(messagePrompt[0]?.temperature);
  }

  // Add feedback or auto-regenerate instructions
  if (autoGenerate) {
    aiConfig.prompt +=
      "\n\nGenerate fresh messages with a new challenge and NEW highlight if more than 1 was provided. Create engaging and varied content.";
  } else if (feedback) {
    aiConfig.prompt += `\n\nUser Feedback: ${feedback}\nPlease regenerate the messages based on this feedback.`;
  }

  // Create the user prompt with batch inputs and highlights
  const userPrompt =
    JSON.stringify(batchInputs) + "\n\nHighlights:\n" + highlightsToUse;

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

  let messageContents: {
    subject: string;
    message: string;
    selected_highlight: string;
    selected_challenge: string;
  }[] = [];

  try {
    messageContents = JSON.parse(responseContent || "[]");
  } catch (error) {
    console.error(`Failed to parse OpenAI response: ${error.message}`);
    return [];
  }

  // Update existing messages instead of inserting new ones
  const results: GeneratedMessage[] = [];
  for (let i = 0; i < messageData.length; i++) {
    const { data: updatedMessageData, error: messageError } = await supabase
      .from("generated_messages")
      .update({
        message_content: messageContents[i].message,
        detail: messageContents[i],
        custom_instructions: customInstructions ?? "",
        generation_date: today,
      })
      .eq("id", messageData[i].messageId)
      .select()
      .single();

    if (messageError) {
      console.error(`Failed to update message: ${messageError.message}`);
      continue;
    }

    // Get preferred match for this prospect
    const { data: preferredMatches } = await supabase
      .from("preferred_matches")
      .select("selected_match")
      .eq("user_id", userId)
      .eq("job_id", messageData[i].savedProspect.prospect_id)
      .not("selected_match", "is", null);

    const selectedMatch = preferredMatches?.[0]?.selected_match;

    results.push({
      prospect: {
        prospect_id: messageData[i].savedProspect.prospect_id,
        company: messageData[i].savedProspect.company,
        job_title: messageData[i].savedProspect.job_title,
      },
      match: {
        first_name: selectedMatch?.name?.split(" ")[0] || "",
        last_name: selectedMatch?.name?.split(" ").slice(1).join(" ") || "",
        title: selectedMatch?.title || "",
      },
      messageContent: messageContents[i].message || "",
      messageSubject: messageContents[i].subject || "",
      messageId: updatedMessageData.id,
    });
  }

  return results;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      autoGenerate,
      feedback = "",
      messageIds = [],
      mentionJobInMessages = true,
      customInstructions = "",
    }: RegenerateRequest = await req.json();

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

    console.log("Regenerating messages for user:", user.id);

    // Validate input
    if (!messageIds || messageIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "messageIds array is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
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

    // Get candidate highlights from user_resumes
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

    // Get selected messages
    const { data: selectedMessages, error: messagesError } = await supabase
      .from("generated_messages")
      .select("*")
      .eq("user_id", user.id)
      .in("id", messageIds);

    if (messagesError || !selectedMessages || selectedMessages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Selected messages not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const generatedMessages: GeneratedMessage[] = [];
        let messageGenerationCount = 0;

        // Remove duplicates by message ID to prevent duplicate processing
        const uniqueMessageIds = [...new Set(messageIds)];

        console.log(
          `Processing ${uniqueMessageIds.length} unique messages for regeneration`
        );

        // Stream initial status
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "status",
              total: uniqueMessageIds.length,
              remaining: uniqueMessageIds.length,
              generated: 0,
            })}\n\n`
          )
        );

        for (
          let i = 0;
          i < uniqueMessageIds.length;
          i += MESSAGE_GENERATION_BATCH_SIZE
        ) {
          const batchIds = uniqueMessageIds.slice(
            i,
            i + MESSAGE_GENERATION_BATCH_SIZE
          );

          // Get batch messages
          const { data: batchMessages, error: batchError } = await supabase
            .from("generated_messages")
            .select("*")
            .eq("user_id", user.id)
            .in("id", batchIds);

          if (batchError || !batchMessages) {
            console.error(`Error fetching batch messages:`, batchError);
            continue;
          }

          // Update remaining count
          const remaining = uniqueMessageIds.length - i;
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "status",
                total: uniqueMessageIds.length,
                remaining: remaining,
                generated: generatedMessages.length + messageGenerationCount,
                processed: i,
              })}\n\n`
            )
          );

          try {
            // Process batch together using OpenAI
            const batchResults = await regenerateMessagesForBatch({
              selectedMessages: batchMessages,
              candidateHighlights,
              mentionJobInMessages,
              customInstructions,
              feedback,
              autoGenerate,
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
                  total: uniqueMessageIds.length,
                  remaining: Math.min(
                    uniqueMessageIds.length -
                      (i + MESSAGE_GENERATION_BATCH_SIZE),
                    0
                  ),
                  generated: generatedMessages.length,
                  processed: Math.min(
                    i + MESSAGE_GENERATION_BATCH_SIZE,
                    uniqueMessageIds.length
                  ),
                })}\n\n`
              )
            );
          } catch (error) {
            console.error(`Error regenerating batch for messages:`, error);
            // Handle error for the batch - you could retry individual messages here if needed
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
              total: uniqueMessageIds.length,
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
    console.error("Error in regenerate-message function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
