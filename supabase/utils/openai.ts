import { OpenAI } from "npm:openai";
import { companyHiringManagerTitlesGenerationPrompt } from "./prompts.ts";

interface HiringManagerTitles {
  company: string;
  hiring_manager_title: string;
  backup_titles: string[];
}

interface JsonInput {
  job_title: string;
  location?: string;
  company: string;
}

export const generateHiringManagerTitlesOpenAi = async ({
  formattedJsonInput,
  prompt,
  model,
}: {
  formattedJsonInput: JsonInput[];
  prompt: string;
  model: string;
}): Promise<HiringManagerTitles[]> => {
  const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

  if (!openAIApiKey) {
    throw new Error("OpenAI API key missing");
  }

  const openai = new OpenAI({
    apiKey: openAIApiKey,
  });

  const openaiResponse = await openai.responses.create({
    model,
    input: [
      { role: "system", content: prompt },
      { role: "user", content: JSON.stringify(formattedJsonInput, null, 2) },
    ],
  });

  const jsonResponse = openaiResponse.output_text
    .replace(/```json/g, "")
    .replace(/```/g, "");

  return JSON.parse(jsonResponse) as HiringManagerTitles[];
};
