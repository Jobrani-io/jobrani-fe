import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";
import matchCacheService from "./matchCacheService";

export interface SavedProspect {
  id: string;
  user_id: string;
  prospect_id: string;
  company: string;
  job_title: string;
  location: string | null;
  posted_on: string | null;
  saved_date: string;
  company_url?: string;
  job_description?: string;
  employment_type: string;
  is_remote: boolean;
  url?: string;
}

export interface PreferredMatch {
  id: string;
  user_id: string;
  prospect_id: string;
  selected_match: JobMatch;
  preferred_at: string;
}

export interface JobMatch {
  name: string;
  title: string;
  linkedin_url: string;
  confidence: number;
  reason: string;
}

export interface MatchResponse {
  matches: JobMatch[];
  cached: boolean;
}

export interface BulkJobMatchRequest {
  prospectId: string;
  company: string;
  jobTitle: string;
  location?: string;
}

export interface MatchService {
  getJobMatches(
    prospectId: string,
    company: string,
    jobTitle: string,
    location?: string
  ): Promise<JobMatch[]>;
  getBulkJobMatches(
    prospects: BulkJobMatchRequest[]
  ): Promise<Map<string, JobMatch[]>>;
  getPreferredMatch(prospectId: string): Promise<PreferredMatch | null>;
  setPreferredMatch(
    prospectId: string,
    selectedMatch: JobMatch
  ): Promise<PreferredMatch | null>;
  removePreferredMatch(prospectId: string): Promise<boolean>;
  getSavedProspects(): Promise<SavedProspect[]>;
  isProspectSaved(prospectId: string): Promise<boolean>;
}

class SavedProspectsService {
  async saveProspect(jobData: {
    prospect_id: string;
    company: string;
    job_title: string;
    location?: string;
    posted_on?: string;
    url?: string;
    company_url?: string;
    job_description: string;
    raw?: any;
    employment_type?: string;
    is_remote?: boolean;
  }): Promise<SavedProspect | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in to save prospects.",
        });
        return null;
      }

      const { data, error } = await supabase
        .from("saved_prospects")
        .insert({
          user_id: user.id,
          prospect_id: jobData.prospect_id,
          company: jobData.company,
          job_title: jobData.job_title,
          location: jobData.location,
          posted_on: jobData.posted_on,
          url: jobData.url,
          company_url: jobData.company_url,
          job_description: jobData.job_description,
          raw: jobData.raw,
          employment_type: jobData.employment_type,
          is_remote: jobData.is_remote || false,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation
          toast({
            title: "Prospect Already Saved",
            description: "This prospect is already in your saved list.",
          });
          return null;
        }
        throw error;
      }

      console.log(`${jobData.job_title} at ${jobData.company} has been saved.`);
      toast({
        title: "Prospect Saved",
        description: `${jobData.job_title} at ${jobData.company} has been saved.`,
      });

      return data as unknown as SavedProspect;
    } catch (error) {
      console.error("Error saving prospect:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Failed to save prospect. Please try again.",
      });
      return null;
    }
  }

  async getSavedProspects(): Promise<SavedProspect[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from("saved_prospects")
        .select("*")
        .eq("user_id", user.id)
        .order("saved_date", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as SavedProspect[];
    } catch (error) {
      console.error("Error fetching saved prospects:", error);
      return [];
    }
  }

  async deleteSavedProspect(prospectId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in to manage saved prospects.",
        });
        return false;
      }

      // Delete from all related tables in parallel
      const deletePromises = [
        // Delete generated messages
        supabase
          .from("generated_messages")
          .delete()
          .eq("user_id", user.id)
          .eq("prospect_id", prospectId),

        // Delete preferred matches
        supabase
          .from("preferred_matches")
          .delete()
          .eq("user_id", user.id)
          .eq("job_id", prospectId),

        // Delete prospect matches
        supabase
          .from("prospect_matches")
          .delete()
          .eq("user_id", user.id)
          .eq("job_id", prospectId),
      ];

      // Execute all deletes in parallel
      await Promise.all(deletePromises);

      // also delete the generated messages from local storage cache?
      // createModule-generatedMessages-v3
      localStorage.removeItem("createModule-generatedMessages-v3");

      // Finally delete the saved prospect
      const { error } = await supabase
        .from("saved_prospects")
        .delete()
        .eq("user_id", user.id)
        .eq("prospect_id", prospectId);

      if (error) throw error;

      // Clear write module cache for this prospect
      this.clearWriteModuleCache(prospectId);

      console.log(`${prospectId} has been removed from your saved list.`);

      return true;
    } catch (error) {
      console.error("Error deleting saved prospect:", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Failed to remove prospect. Please try again.",
      });
      return false;
    }
  }

  private clearWriteModuleCache(prospectId: string) {
    // Clear any write module localStorage entries related to this prospect
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("writeModule-") && key.includes(prospectId)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Also clear match cache for this prospect
    const cachedKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("matchCache-") && key.includes(prospectId)) {
        cachedKeys.push(key);
      }
    }

    cachedKeys.forEach((key) => localStorage.removeItem(key));

    // Clear write materials cache (generated messages)
    // This will force a refresh of write materials when the user goes back to Write module
    localStorage.removeItem("createModule-generatedMessages-v3");
  }

  async getJobMatches(
    prospectId: string,
    company: string,
    jobTitle: string,
    location?: string
  ): Promise<JobMatch[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in to get job matches.",
        });
        return [];
      }

      // Check cache first
      const cachedMatches = matchCacheService.getCachedMatches({
        jobId: prospectId,
        company,
        jobTitle,
        location,
        userId: user.id,
      });

      if (cachedMatches) {
        console.log(`Using cached matches for ${company} - ${jobTitle}`);
        return cachedMatches;
      }

      // Check if we already have matches in the database (including custom contacts)
      const { data: existingMatch, error: fetchError } = await supabase
        .from("prospect_matches")
        .select("matches")
        .eq("job_id", prospectId)
        .eq("user_id", user.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      const existingMatches =
        (existingMatch?.matches as unknown as JobMatch[]) || [];

      // If we have existing matches (including custom contacts), return them
      if (existingMatches.length > 0) {
        console.log(
          `Using existing database matches for ${company} - ${jobTitle} (${existingMatches.length} matches)`
        );

        // Cache the existing matches for future requests
        matchCacheService.cacheMatches(
          {
            jobId: prospectId,
            company,
            jobTitle,
            location,
            userId: user.id,
          },
          existingMatches
        );

        return existingMatches;
      }

      // Only call the search API if no matches exist in the database
      console.log(
        `No existing matches found, fetching new matches for ${company} - ${jobTitle}`
      );
      const response = await supabase.functions.invoke("search-matches", {
        body: {
          job_id: prospectId,
          user_id: user.id,
          company,
          job_title: jobTitle,
          location,
        },
      });

      if (response.error) {
        throw response.error;
      }

      const result = response.data as MatchResponse;
      const matches = result.matches || [];

      // Save the API results to the database
      if (matches.length > 0) {
        await supabase.from("prospect_matches").upsert(
          {
            job_id: prospectId,
            user_id: user.id,
            matches: matches as unknown as Json,
          },
          {
            onConflict: "user_id, job_id",
          }
        );
      }

      // Cache the results
      matchCacheService.cacheMatches(
        {
          jobId: prospectId,
          company,
          jobTitle,
          location,
          userId: user.id,
        },
        matches
      );

      return matches;
    } catch (error) {
      console.error("Error getting job matches:", error);
      toast({
        variant: "destructive",
        title: "Match Failed",
        description: "Failed to get hiring manager matches. Please try again.",
      });
      return [];
    }
  }

  enrichCompanyWithDotomDomain(company: string): string {
    if (company.startsWith("http")) {
      return company;
    }

    return `${company}.com`;
  }

  async getBulkJobMatches(
    prospects: Array<{
      prospectId: string;
      company: string;
      jobTitle: string;
      location?: string;
    }>
  ): Promise<Map<string, JobMatch[]>> {
    try {
      console.log("getBulkJobMatches", prospects);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in to get job matches.",
        });
        return new Map();
      }

      const results = new Map<string, JobMatch[]>();

      // Get cached results first
      const cachedResults = matchCacheService.getProspectsWithCachedMatches(
        prospects,
        user.id
      );
      cachedResults.forEach(({ prospect, cachedMatches }) => {
        results.set(prospect.prospectId, cachedMatches);
        console.log(
          `Using cached matches for ${prospect.company} - ${prospect.jobTitle}`
        );
      });

      // Get uncached prospects that need API calls
      const uncachedProspects = matchCacheService.getUncachedProspects(
        prospects,
        user.id
      );

      if (uncachedProspects.length === 0) {
        console.log("All prospects found in cache, no API calls needed");
        return results;
      }

      console.log(
        `Fetching new matches for ${uncachedProspects.length} uncached prospects`
      );

      // Process uncached prospects in batches of 5
      const batchSize = 5;
      for (let i = 0; i < uncachedProspects.length; i += batchSize) {
        const batch = uncachedProspects.slice(i, i + batchSize);

        const batchPayload = batch.map((prospect) => ({
          job_id: prospect.prospectId,
          user_id: user.id,
          company: this.enrichCompanyWithDotomDomain(prospect.company),
          job_title: prospect.jobTitle,
          location: prospect.location,
        }));

        console.log({
          batch,
          batchPayload,
        });
        try {
          const response = await supabase.functions.invoke("search-matches", {
            body: batchPayload,
          });

          if (response.error) {
            throw response.error;
          }

          // Process the response - it should be an array of SearchMatchesResponse
          const batchResults = response.data as Array<{
            job_id: string;
            matches: JobMatch[];
          }>;

          // Map results back to prospect IDs and cache them
          batchResults.forEach((result) => {
            const matches = result.matches || [];
            results.set(result.job_id, matches);

            // Cache the result
            const prospect = batch.find((p) => p.prospectId === result.job_id);
            if (prospect) {
              matchCacheService.cacheMatches(
                {
                  jobId: prospect.prospectId,
                  company: prospect.company,
                  jobTitle: prospect.jobTitle,
                  location: prospect.location,
                  userId: user.id,
                },
                matches
              );
            }
          });
        } catch (error) {
          console.error(`Error processing batch ${i / batchSize + 1}:`, error);
          // Continue with next batch even if one fails
        }
      }

      return results;
    } catch (error) {
      console.error("Error getting bulk job matches:", error);
      toast({
        variant: "destructive",
        title: "Bulk Match Failed",
        description:
          "Failed to get hiring manager matches for some jobs. Please try again.",
      });
      return new Map();
    }
  }

  async isProspectSaved(prospectId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from("saved_prospects")
        .select("id")
        .eq("user_id", user.id)
        .eq("prospect_id", prospectId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return !!data;
    } catch (error) {
      console.error("Error checking if prospect is saved:", error);
      return false;
    }
  }

  async setPreferredMatch(
    prospectId: string,
    selectedMatch: JobMatch
  ): Promise<PreferredMatch | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in to set preferred matches.",
        });
        return null;
      }

      const { data, error } = await supabase
        .from("preferred_matches")
        .upsert({
          user_id: user.id,
          job_id: prospectId,
          selected_match: selectedMatch as any,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation
          // Update existing preference
          const { data: updateData, error: updateError } = await supabase
            .from("preferred_matches")
            .update({ selected_match: selectedMatch as any })
            .eq("user_id", user.id)
            .eq("job_id", prospectId)
            .select()
            .single();

          if (updateError) throw updateError;
          return {
            ...updateData,
            prospect_id: updateData.job_id,
            selected_match: updateData.selected_match as unknown as JobMatch,
          };
        }
        throw error;
      }

      console.log(
        `Selected ${selectedMatch.name} as your preferred hiring manager.`
      );

      return {
        ...data,
        prospect_id: data.job_id,
        selected_match: data.selected_match as unknown as JobMatch,
      };
    } catch (error) {
      console.error("Error setting preferred match:", error);
      toast({
        variant: "destructive",
        title: "Set Failed",
        description: "Failed to set preferred match. Please try again.",
      });
      return null;
    }
  }

  async getPreferredMatch(prospectId: string): Promise<PreferredMatch | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("preferred_matches")
        .select("*")
        .eq("user_id", user.id)
        .eq("job_id", prospectId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data
        ? {
            ...data,
            prospect_id: data.job_id,
            selected_match: data.selected_match as unknown as JobMatch,
          }
        : null;
    } catch (error) {
      console.error("Error getting preferred match:", error);
      return null;
    }
  }

  async removePreferredMatch(prospectId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in to manage preferred matches.",
        });
        return false;
      }

      const { error } = await supabase
        .from("preferred_matches")
        .delete()
        .eq("user_id", user.id)
        .eq("job_id", prospectId);

      if (error) throw error;

      // Also delete associated write materials when match is removed
      const { error: messagesError } = await supabase
        .from("generated_messages")
        .delete()
        .eq("user_id", user.id)
        .eq("prospect_id", prospectId);

      if (messagesError) {
        console.error("Error deleting write materials for removed match:", messagesError);
      } else {
        console.log(`Deleted write materials for removed match: ${prospectId}`);
      }

      // Clear localStorage cache for write materials
      this.clearWriteModuleCache(prospectId);

      console.log(`Preferred match removed for ${prospectId}.`);

      return true;
    } catch (error) {
      console.error("Error removing preferred match:", error);
      toast({
        variant: "destructive",
        title: "Remove Failed",
        description: "Failed to remove preferred match. Please try again.",
      });
      return false;
    }
  }

  async addCustomContactToMatches(
    prospectId: string,
    customContact: JobMatch
  ): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in to add custom contacts.",
        });
        return false;
      }

      // First, get existing matches for this job
      const { data: existingMatch, error: fetchError } = await supabase
        .from("prospect_matches")
        .select("matches")
        .eq("job_id", prospectId)
        .eq("user_id", user.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      const existingMatches =
        (existingMatch?.matches as unknown as JobMatch[]) || [];

      // Check if this custom contact already exists (by LinkedIn URL)
      const existingCustom = existingMatches.find(
        (match) => match.linkedin_url === customContact.linkedin_url
      );

      if (existingCustom) {
        toast({
          title: "Contact Already Exists",
          description: "This contact is already in your matches list.",
        });
        return false;
      }

      // Add the custom contact to the existing matches
      const updatedMatches = [...existingMatches, customContact];

      // Upsert the updated matches array
      const { error } = await supabase.from("prospect_matches").upsert(
        {
          job_id: prospectId,
          user_id: user.id,
          matches: updatedMatches as unknown as Json,
        },
        {
          onConflict: "user_id, job_id",
        }
      );

      if (error) throw error;

      console.log(
        `Custom contact ${customContact.name} added to matches for ${prospectId}`
      );
      toast({
        title: "Contact Added",
        description: `${customContact.name} has been added to your matches.`,
      });

      return true;
    } catch (error) {
      console.error("Error adding custom contact to matches:", error);
      toast({
        variant: "destructive",
        title: "Add Failed",
        description: "Failed to add custom contact. Please try again.",
      });
      return false;
    }
  }
}

const savedProspectsService = new SavedProspectsService();
export default savedProspectsService;
