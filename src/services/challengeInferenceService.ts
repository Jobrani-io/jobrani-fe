import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

class ChallengeInferenceService {
  private isProcessing = false;
  private lastProcessedTime = 0;
  private readonly COOLDOWN_MS = 5000; // 5 seconds cooldown to prevent spam

  async runChallengeIdentifierForSavedJobs(): Promise<boolean> {
    // Prevent multiple concurrent calls
    if (this.isProcessing) {
      console.log("Challenge identifier already running, skipping");
      return false;
    }

    // Implement cooldown to prevent spam
    const now = Date.now();
    if (now - this.lastProcessedTime < this.COOLDOWN_MS) {
      console.log("Challenge identifier on cooldown, skipping");
      return false;
    }

    try {
      this.isProcessing = true;
      this.lastProcessedTime = now;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("No authenticated user, skipping challenge identifier");
        return false;
      }

      console.log("Running challenge identifier for saved jobs...");

      const { data, error } = await supabase.functions.invoke(
        "challenge-identifier"
      );

      if (error) {
        console.error("Error running challenge identifier:", error);
        // Don't show error toast as this is a background operation
        return false;
      }

      const successMessage = data?.success
        ? "Challenge identification completed successfully"
        : "No new challenges to process";
      console.log(successMessage);

      return true;
    } catch (error) {
      console.error("Error running challenge identifier:", error);
      return false;
    } finally {
      this.isProcessing = false;
    }
  }

  isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }
}

export default new ChallengeInferenceService();
