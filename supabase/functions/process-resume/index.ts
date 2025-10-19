import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";
import OpenAI from "npm:openai";
import { DEFAULT_OPENAI_MODEL } from "../../utils/constant.ts";
import { uploadFile } from "../_shared/storage.ts";

interface UploadResponse {
  id: string;
  object: string;
  bytes: number;
  created_at: number;
  filename: string;
  purpose: string;
  status: string;
  expires_at: number;
}

interface UploadPartResponse {
  id: string;
  object: string;
  created_at: number;
  upload_id: string;
}

interface CompleteUploadResponse {
  id: string;
  object: string;
  bytes: number;
  created_at: number;
  filename: string;
  purpose: string;
  status: string;
  expires_at: number;
  file: {
    id: string;
    object: string;
    bytes: number;
    created_at: number;
    filename: string;
    purpose: string;
  };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function uploadLargeFileToOpenAI(
  file: File,
  openaiApiKey: string,
  purpose: string = "assistants"
): Promise<string> {
  const CHUNK_SIZE = 64 * 1024 * 1024; // 64MB chunks
  const fileBuffer = new Uint8Array(await file.arrayBuffer());
  const totalBytes = fileBuffer.length;
  console.log("upload large file to openai");

  // Create upload
  const createUploadResponse = await fetch(
    "https://api.openai.com/v1/uploads",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bytes: totalBytes,
        filename: file.name,
        mime_type: file.type,
        purpose: purpose,
      }),
    }
  );

  if (!createUploadResponse.ok) {
    throw new Error(
      `Failed to create upload: ${createUploadResponse.statusText}`
    );
  }

  const uploadData: UploadResponse = await createUploadResponse.json();
  const uploadId = uploadData.id;

  // Upload parts
  const partIds: string[] = [];
  const totalParts = Math.ceil(totalBytes / CHUNK_SIZE);

  for (let i = 0; i < totalParts; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, totalBytes);
    const chunk = fileBuffer.slice(start, end);

    const formData = new FormData();
    formData.append(
      "data",
      new File([chunk], `part_${i}`, { type: "application/octet-stream" })
    );

    const addPartResponse = await fetch(
      `https://api.openai.com/v1/uploads/${uploadId}/parts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: formData,
      }
    );

    if (!addPartResponse.ok) {
      const errorText = await addPartResponse.text();
      throw new Error(`Failed to upload part ${i + 1}: ${errorText}`);
    }

    const partData: UploadPartResponse = await addPartResponse.json();
    partIds.push(partData.id);
  }

  // Complete upload
  const completeUploadResponse = await fetch(
    `https://api.openai.com/v1/uploads/${uploadId}/complete`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        part_ids: partIds,
      }),
    }
  );

  if (!completeUploadResponse.ok) {
    throw new Error(
      `Failed to complete upload: ${completeUploadResponse.statusText}`
    );
  }

  const completeData: CompleteUploadResponse =
    await completeUploadResponse.json();
  return completeData.file.id;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();

    // Extract the file from FormData
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    console.log("Processing resume for user:", user.id);

    // Extract highlights using OpenAI
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

    // Get fileName from the File object and make it unique
    const fileName = file.name;
    const timestamp = Date.now();
    const uniqueFileName = `${user.id}_${timestamp}_${fileName}`;

    const openai = new OpenAI({
      apiKey: openAIApiKey,
    });

    // Create a new File with the unique name for OpenAI
    const fileBuffer = new Uint8Array(await file.arrayBuffer());
    const uniqueFile = new File([fileBuffer], uniqueFileName, {
      type: file.type,
    });

    // Determine upload method based on file type and size
    let fileId: string;
    const isPdf =
      file.type === "application/pdf" ||
      fileName.toLowerCase().endsWith(".pdf");
    const fileSizeInMB = file.size / (1024 * 1024);

    if (isPdf) {
      // Use standard upload for PDFs or files smaller than 512MB
      const openAIFile = await openai.files.create({
        file: uniqueFile,
        purpose: "assistants",
      });
      fileId = openAIFile.id;
    } else {
      // Use chunked upload for non-PDF files larger than 512MB
      fileId = await uploadLargeFileToOpenAI(
        uniqueFile,
        openAIApiKey,
        "assistants"
      );
    }

    await uploadFile(supabase, uniqueFile, "resumes");

    const vectorStore = await openai.vectorStores.create({
      name: `resume-vector-store-${user.id}`,
      metadata: {
        user_id: user.id,
      },
    });

    const vectorStoreId = vectorStore.id;

    await openai.vectorStores.files.create(vectorStoreId, {
      file_id: fileId,
    });

    const response = await openai.responses.create({
      model: DEFAULT_OPENAI_MODEL,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `You are the Career Highlights Extraction Agent.
Objective
Extract 10 career highlights from resumes.


Output
Return text input separated by new lines (no prose, no markdown, no extra text).

Do not invent facts.

Rules
Exactly 10 highlights total.

Each highlight ≤ 25 words.

Every highlight must include CONTEXT (company name, sector, size, or stage).
Examples: "$350M B2B FinTech", "at Bokksu", "for PE-backed SaaS".

Required coverage
Experience bullet — overall years in a function/industry
e.g. "12+ years in SaaS demand gen".

Name-dropper bullet — reference to recognized companies, category winners, or top competitors for credibility.
Remaining 8 bullets — balanced across:
Financial/operational outcomes (ARR, CAC, EBITDA, LTV, pipeline).
Leadership/team scope (team size, budgets, cross-functional leadership).
Strategic impact (repositioning, GTM, M&A, expansion).
Credibility/recognition (exits, PE/VC-backed, advisor/board roles).

Additional constraints:

Use both career-level (overall scope) and role-level (quantified outcomes at specific companies).
No duplicate metrics (consolidate if needed).
Be concrete and plainspoken.
No filler or vague language.

Output only text.`,
            },
          ],
        },
      ],
      tools: [
        {
          type: "file_search",
          vector_store_ids: [vectorStoreId],
        },
      ],
    });

    const highlights = response.output_text;

    const resumeResult = await supabase
      .from("user_resumes")
      .insert({
        user_id: user.id,
        file_name: uniqueFileName,
        file_id: fileId,
        highlights: highlights,
        content: "",
      })
      .select();

    return new Response(
      JSON.stringify({
        success: true,
        highlights: highlights,
        resumeId: resumeResult?.data?.[0]?.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in process-resume function:", error);

    // Handle specific error types
    if (error?.name === "StorageApiError" && error?.statusCode === "409") {
      return new Response(
        JSON.stringify({
          error:
            "A file with this name already exists. Please try uploading again or rename your file.",
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Handle OpenAI API errors
    if (error?.message?.includes("OpenAI")) {
      return new Response(
        JSON.stringify({
          error:
            "Failed to process resume with AI. Please try again or contact support.",
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generic error handling
    return new Response(
      JSON.stringify({
        error:
          error?.message ||
          "An unexpected error occurred while processing your resume.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
