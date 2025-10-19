import { FloatingActionBar } from "@/components/FloatingActionBar";
import { MessageTable } from "@/components/MessageTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApprovedMessagesTable } from "@/components/write/ApprovedMessagesTable";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { unifiedWriteDataService } from "@/data/unifiedMockData";
import { useToast } from "@/hooks/use-toast";
import { useGlobalMockData } from "@/hooks/useGlobalMockData";
import usePersistedState, { validators } from "@/hooks/usePersistedState";
import { useProfileData } from "@/hooks/useProfileData";
import { supabase, SUPABASE_URL } from "@/integrations/supabase/client";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onboardingService } from "@/services/onboardingService";
export interface MessageCustomization {
  instructions: string;
  selectedMessages?: string[];
}

// Trimmed prospect data structure from backend
interface TrimmedProspect {
  prospect_id: string;
  company: string;
  job_title: string;
}

// Trimmed preferred match data structure from backend
interface TrimmedPreferredMatch {
  first_name: string;
  last_name: string;
  title: string;
}

// Generated message structure
interface GeneratedMessage {
  prospect: TrimmedProspect;
  match: TrimmedPreferredMatch;
  message: string;
  subject: string;
  messageId: string;
  approved?: boolean;
  messageType?: "LinkedIn Connect" | "Follow-up" | "InMail";
}

// Simplified management box component
const SimpleManagementBox = ({
  profileData,
  onGenerateMessages,
  isGenerating,
  messageCount,
  generationProgress,
  isPolling,
}: {
  profileData: any;
  onGenerateMessages: () => void;
  isGenerating: boolean;
  messageCount: number;
  generationProgress: { total: number; generated: number; remaining: number };
  isPolling: boolean;
}) => {
  const navigate = useNavigate();

  const hasValidProfile = profileData.personalHighlights.length > 0;

  if (!hasValidProfile) {
    return (
      <Card className="bg-gradient-subtle border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">
                Profile Setup Required
              </h2>
              <p className="text-muted-foreground">
                Complete your profile setup in the Design module to start
                generating messages.
              </p>
            </div>
            <Button onClick={() => navigate("/hub?tab=design")}>
              Complete Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          {messageCount === 0 && (
            <h2 className="text-xl font-semibold text-foreground">
              Generated Messages
            </h2>
          )}
        </div>
        {messageCount === 0 && !isGenerating && (
          <Button
            onClick={onGenerateMessages}
            disabled={isGenerating}
            size="sm"
          >
            Generate Messages
          </Button>
        )}
      </div>

      {/* Progress indicator during generation */}
      {(isGenerating || isPolling) && generationProgress.total > 0 && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {isPolling
                ? "Checking for new messages..."
                : "Generating messages..."}
            </span>
            <span>
              {generationProgress.generated} / {generationProgress.total}
            </span>
          </div>
          <div className="w-full bg-background rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  generationProgress.total > 0
                    ? (generationProgress.generated /
                        generationProgress.total) *
                      100
                    : 0
                }%`,
              }}
            />
          </div>
          {generationProgress.remaining > 0 && (
            <div className="text-xs text-muted-foreground">
              {generationProgress.remaining} remaining to generate
              {isPolling && " (background processing)"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CreateModule = () => {
  const { toast } = useToast();
  const { profileData } = useProfileData();

  console.log({ profileData });

  const [generatedMessages, setGeneratedMessages] = usePersistedState({
    key: "createModule-generatedMessages-v3",
    defaultValue: [] as GeneratedMessage[],
    expirationHours: 24, // Keep messages for 24 hours
    validator: validators.isArray,
  });

  const [selectedMessages, setSelectedMessages] = usePersistedState({
    key: "createModule-selectedMessages-v3",
    defaultValue: [] as string[],
    expirationHours: 24,
    validator: validators.isArray,
  });

  const [dailyStats, setDailyStats] = usePersistedState({
    key: "createModule-dailyStats-v3",
    defaultValue: { used: 0, limit: 10, remaining: 10 },
    expirationHours: 24, // Reset daily
    validator: (
      value: unknown
    ): value is { used: number; limit: number; remaining: number } => {
      return (
        typeof value === "object" &&
        value !== null &&
        "used" in value &&
        "limit" in value &&
        "remaining" in value &&
        typeof (value as any).used === "number" &&
        typeof (value as any).limit === "number" &&
        typeof (value as any).remaining === "number"
      );
    },
  });

  const { useMockData: isMockMode } = useGlobalMockData();

  console.log("CreateModule - isMockMode:", isMockMode);

  const [showApproved, setShowApproved] = usePersistedState({
    key: "createModule-showApproved",
    defaultValue: false,
  });

  // Generation state - persisted to survive navigation
  const [isGeneratingMessages, setIsGeneratingMessages] = usePersistedState({
    key: "createModule-isGeneratingMessages",
    defaultValue: false,
    expirationHours: 1, // Auto-clear after 1 hour to prevent stuck state
  });

  const [generationProgress, setGenerationProgress] = usePersistedState({
    key: "createModule-generationProgress",
    defaultValue: { total: 0, generated: 0, remaining: 0 },
    expirationHours: 1,
    validator: (
      value: unknown
    ): value is { total: number; generated: number; remaining: number } => {
      return (
        typeof value === "object" &&
        value !== null &&
        "total" in value &&
        "generated" in value &&
        "remaining" in value &&
        typeof (value as any).total === "number" &&
        typeof (value as any).generated === "number" &&
        typeof (value as any).remaining === "number"
      );
    },
  });

  const [generationStartTime, setGenerationStartTime] = usePersistedState({
    key: "createModule-generationStartTime",
    defaultValue: null as number | null,
    expirationHours: 1,
  });

  // Non-persisted state (resets on navigation)
  const [selectedApprovedMessages, setSelectedApprovedMessages] = useState<
    string[]
  >([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regeneratingMessageIds, setRegeneratingMessageIds] = useState<
    Set<string>
  >(new Set());
  const [savingMessageIds, setSavingMessageIds] = useState<Set<string>>(
    new Set()
  );
  const [isGeneratedMessageChecked, setIsGeneratedMessageChecked] =
    useState(false);
  const [isPolling, setIsPolling] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMessages, setEditingMessages] = useState<GeneratedMessage[]>(
    []
  );
  const [editContent, setEditContent] = useState<Record<string, string>>({});
  const [editSubjects, setEditSubjects] = useState<Record<string, string>>({});

  const { isLimitReached } = useSubscription();

  // Function to fetch existing generated messages
  const fetchExistingMessages = useCallback(async () => {
    if (isMockMode) return; // Skip for mock mode

    try {
      setIsLoadingMessages(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      // Step 1: Get preferred matches
      const { data: preferredMatches, error: matchesError } = await supabase
        .from("preferred_matches")
        .select("job_id, selected_match")
        .eq("user_id", session.user.id);

      if (matchesError) {
        console.error("Error fetching preferred matches:", matchesError);
        return;
      }

      if (!preferredMatches || preferredMatches.length === 0) {
        return;
      }

      // Step 2: Get saved prospects for those job_ids
      const jobIds = preferredMatches.map((pm) => pm.job_id);
      const { data: savedProspects, error: prospectsError } = await supabase
        .from("saved_prospects")
        .select("prospect_id, company, job_title")
        .eq("user_id", session.user.id)
        .in("prospect_id", jobIds);

      if (prospectsError) {
        console.error("Error fetching saved prospects:", prospectsError);
        return;
      }

      // Step 3: Get the latest generated message for each prospect in one query
      const { data: allMessages, error: messagesError } = await supabase
        .from("generated_messages")
        .select("*")
        .eq("user_id", session.user.id)
        .in("prospect_id", jobIds)
        .order("created_at", { ascending: false });

      if (messagesError) {
        console.error("Error fetching generated messages:", messagesError);
        return;
      }

      if (!allMessages || allMessages.length === 0) {
        return;
      }

      // Step 4: Group messages by prospect_id and get the latest for each
      const latestMessagesByProspect = new Map();
      allMessages.forEach((msg) => {
        if (!latestMessagesByProspect.has(msg.prospect_id)) {
          latestMessagesByProspect.set(msg.prospect_id, msg);
        }
      });

      // Step 5: Build enriched messages efficiently
      const enrichedMessages = Array.from(
        latestMessagesByProspect.values()
      ).map((msg) => {
        const preferredMatch = preferredMatches.find(
          (pm) => pm.job_id === msg.prospect_id
        );
        const savedProspect = savedProspects?.find(
          (sp) => sp.prospect_id === msg.prospect_id
        );
        const selectedMatch = preferredMatch?.selected_match as any;

        return {
          prospect: {
            prospect_id: msg.prospect_id,
            company: savedProspect?.company || "Unknown Company",
            job_title: savedProspect?.job_title || "Unknown Title",
          },
          match: {
            first_name: selectedMatch?.name?.split(" ")[0] || "",
            last_name: selectedMatch?.name?.split(" ").slice(1).join(" ") || "",
            title: selectedMatch?.title || "",
          },
          message: msg.message_content,
          subject: msg.detail?.subject || "",
          messageId: msg.id,
          approved: false,
          messageType: "LinkedIn Connect" as const,
        };
      });

      // Update state with fetched messages
      setGeneratedMessages(enrichedMessages);

      // Auto-select all unapproved messages
      const unapprovedMessageIds = enrichedMessages
        .filter((msg) => !msg.approved)
        .map((msg) => msg.messageId);
      setSelectedMessages(unapprovedMessageIds);
    } catch (error) {
      console.error("Error fetching existing messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [isMockMode, setGeneratedMessages, setSelectedMessages]);

  // Fetch existing messages on component mount
  useEffect(() => {
    // Only fetch if we don't already have messages in local storage
    if (generatedMessages.length === 0) {
      fetchExistingMessages();
    }
  }, [generatedMessages.length, fetchExistingMessages]); // Run when messages length changes or function changes

  // Show restoration message when persisted data is loaded
  useEffect(() => {
    if (!isMockMode && generatedMessages.length > 0) {
      // Auto-select all unapproved messages on restoration
      const unapprovedMessageIds = generatedMessages
        .filter((msg) => !msg.approved)
        .map((msg) => msg.messageId);
      setSelectedMessages(unapprovedMessageIds);

      toast({
        title: "Work restored",
        description: "Your previous session has been restored.",
      });
    }

    // Check if generation was interrupted and show appropriate message
    if (isGeneratingMessages) {
      const now = Date.now();
      const timeSinceStart = generationStartTime
        ? now - generationStartTime
        : 0;
      const isStale = timeSinceStart > 5 * 60 * 1000; // 5 minutes

      if (generationProgress.total > 0) {
        const isComplete =
          generationProgress.generated >= generationProgress.total;

        if (isComplete) {
          // Generation completed while away, clear the generating state
          setIsGeneratingMessages(false);
          setGenerationProgress({ total: 0, generated: 0, remaining: 0 });
          setGenerationStartTime(null);
          toast({
            title: "Generation completed",
            description: "Message generation finished while you were away.",
          });
        } else if (isStale) {
          // Generation seems stuck, clear state
          setIsGeneratingMessages(false);
          setGenerationProgress({ total: 0, generated: 0, remaining: 0 });
          setGenerationStartTime(null);
          toast({
            title: "Generation timed out",
            description:
              "Generation was stopped due to timeout. You can start a new generation.",
            variant: "destructive",
          });
        } else {
          // Still generating, start polling for updates
          setIsPolling(true);
          toast({
            title: "Generation in progress",
            description: `Continuing background generation (${generationProgress.generated}/${generationProgress.total} completed)`,
          });
        }
      } else if (isStale) {
        // No progress but stuck in generating state
        setIsGeneratingMessages(false);
        setGenerationStartTime(null);
      }
    }
  }, []); // Only run on mount

  // Polling effect to check for background generation progress
  useEffect(() => {
    if (!isPolling || isMockMode) return;

    const pollInterval = setInterval(async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        // Check for new messages since last count
        const { data: messages, error } = await supabase
          .from("generated_messages")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error polling for messages:", error);
          return;
        }

        const currentMessageCount = generatedMessages.length;
        const newMessageCount = messages?.length || 0;

        if (newMessageCount > currentMessageCount) {
          // For polling, we need to enrich the data since database doesn't have all fields
          const enrichedMessages = await Promise.all(
            messages.map(async (msg) => {
              // Get prospect info from saved_prospects
              const { data: savedProspect } = await supabase
                .from("saved_prospects")
                .select("*")
                .eq("prospect_id", msg.prospect_id)
                .eq("user_id", session.user.id)
                .single();

              // Get preferred match
              const { data: preferredMatch } = await supabase
                .from("preferred_matches")
                .select("selected_match")
                .eq("job_id", msg.prospect_id)
                .eq("user_id", session.user.id)
                .single();

              const selectedMatch = preferredMatch?.selected_match as any;

              return {
                prospect: {
                  prospect_id: msg.prospect_id,
                  company: savedProspect?.company || "Unknown Company",
                  job_title: savedProspect?.job_title || "Unknown Title",
                },
                match: {
                  first_name: selectedMatch?.name?.split(" ")[0] || "",
                  last_name:
                    selectedMatch?.name?.split(" ").slice(1).join(" ") || "",
                  title: selectedMatch?.title || "",
                },
                message: msg.message_content,
                subject: (msg as any).detail?.subject || "",
                messageId: msg.id,
                approved: false,
                messageType: "LinkedIn Connect" as const,
              };
            })
          );

          // New messages arrived, refresh the data
          setGeneratedMessages(enrichedMessages);

          // Update progress
          if (generationProgress.total > 0) {
            const newGenerated = Math.min(
              newMessageCount,
              generationProgress.total
            );
            const remaining = Math.max(
              0,
              generationProgress.total - newGenerated
            );

            setGenerationProgress((prev) => ({
              ...prev,
              generated: newGenerated,
              remaining,
            }));

            // Check if complete
            if (newGenerated >= generationProgress.total) {
              setIsGeneratingMessages(false);
              setIsPolling(false);
              setGenerationProgress({ total: 0, generated: 0, remaining: 0 });
              setGenerationStartTime(null);
              toast({
                title: "Generation completed",
                description: "All messages have been generated successfully!",
              });
            }
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [isPolling, isMockMode, generatedMessages.length, generationProgress]);

  // Only refresh messages when explicitly switching between mock/live modes
  // This prevents clearing approvals on every component mount
  const [previousMockDataState, setPreviousMockDataState] =
    useState(isMockMode);

  useEffect(() => {
    // Only refresh when actually switching modes, not on initial mount
    if (
      previousMockDataState !== isMockMode &&
      isMockMode &&
      generatedMessages.length > 0
    ) {
      // Regenerate messages in mock mode to pick up latest preferred matches
      const refreshMessages = async () => {
        const data = await unifiedWriteDataService.generateMessages();
        const { messages, dailyStats: stats } = data as {
          messages: GeneratedMessage[];
          dailyStats: { used: number; limit: number; remaining: number };
        };
        setGeneratedMessages(messages);
        setDailyStats(stats);
      };
      refreshMessages();
      setPreviousMockDataState(isMockMode);
    } else if (previousMockDataState !== isMockMode) {
      setPreviousMockDataState(isMockMode);
    }
  }, [
    isMockMode,
    previousMockDataState,
    generatedMessages.length,
    setGeneratedMessages,
    setDailyStats,
  ]);

  // TODO this can be removed once we have the concept of campaign and campaignId to link everything
  useEffect(() => {
    if (generatedMessages.length === 0) return;
    // Check if profile has highlights - if not, don't auto-generate
    if (profileData.personalHighlights.length === 0) return;

    (async () => {
      if (!isGeneratedMessageChecked) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          toast({
            title: "Authentication required",
            description: "Please log in to generate messages.",
            variant: "destructive",
          });
          return;
        }
        const savedProspects = await supabase
          .from("saved_prospects")
          .select("*")
          .eq("user_id", session.user.id);
        console.log(
          "Generating messages because saved prospects and generated messages are different"
        );
        // saved prospect that we should try
        const savedProspectIds = savedProspects.data?.map(
          (prospect) => prospect.prospect_id
        );

        const filteredSavedProspectIds = savedProspectIds?.filter(
          (id) =>
            !generatedMessages.some(
              (message) => message.prospect.prospect_id === id
            )
        );

        if (filteredSavedProspectIds.length > 0) {
          await generateMessages(undefined);
          setIsGeneratedMessageChecked(true);
        } else {
          setIsGeneratedMessageChecked(true);
        }
      }
    })();
  }, [generatedMessages, profileData.personalHighlights]);

  // Message management functions
  const handleEditMessage = useCallback(
    async (messageId: string, newContent: string) => {
      try {
        // Add to saving set
        setSavingMessageIds((prev) => new Set(prev).add(messageId));

        // Update local state immediately for better UX
        setGeneratedMessages((prev) =>
          prev.map((msg) =>
            msg.messageId === messageId ? { ...msg, message: newContent } : msg
          )
        );

        // Save to database if not in mock mode
        if (!isMockMode) {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session) {
            toast({
              title: "Authentication required",
              description: "Please log in to save changes.",
              variant: "destructive",
            });
            return;
          }

          const { error } = await supabase
            .from("generated_messages")
            .update({
              message_content: newContent,
              updated_at: new Date().toISOString(),
            })
            .eq("id", messageId)
            .eq("user_id", session.user.id);

          if (error) {
            console.error("Error saving message:", error);
            toast({
              title: "Save failed",
              description: "Failed to save message changes. Please try again.",
              variant: "destructive",
            });
            return;
          }
        }

        const message = generatedMessages.find(
          (m) => m.messageId === messageId
        );
        toast({
          title: "Message updated",
          description: `Message for ${message?.match.first_name} ${message?.match.last_name} has been updated and saved.`,
        });
      } catch (error) {
        console.error("Error updating message:", error);
        toast({
          title: "Update failed",
          description: "Failed to update message. Please try again.",
          variant: "destructive",
        });
      } finally {
        // Remove from saving set
        setSavingMessageIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(messageId);
          return newSet;
        });
      }
    },
    [generatedMessages, toast, isMockMode]
  );

  const handleEditSubject = useCallback(
    async (messageId: string, newSubject: string) => {
      try {
        // Add to saving set
        setSavingMessageIds((prev) => new Set(prev).add(messageId));

        // Update local state immediately for better UX
        setGeneratedMessages((prev) =>
          prev.map((msg) =>
            msg.messageId === messageId ? { ...msg, subject: newSubject } : msg
          )
        );

        // Save to database if not in mock mode
        if (!isMockMode) {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session) {
            toast({
              title: "Authentication required",
              description: "Please log in to save changes.",
              variant: "destructive",
            });
            return;
          }

          // Get current detail and update subject
          const { data: currentMessage } = await supabase
            .from("generated_messages")
            .select("detail")
            .eq("id", messageId)
            .eq("user_id", session.user.id)
            .single();

          const currentDetail = (currentMessage as any)?.detail || {};
          const updatedDetail = { ...currentDetail, subject: newSubject };

          const { error } = await supabase
            .from("generated_messages")
            .update({
              detail: updatedDetail,
              updated_at: new Date().toISOString(),
            })
            .eq("id", messageId)
            .eq("user_id", session.user.id);

          if (error) {
            console.error("Error saving subject:", error);
            toast({
              title: "Save failed",
              description: "Failed to save subject changes. Please try again.",
              variant: "destructive",
            });
            return;
          }
        }

        const message = generatedMessages.find(
          (m) => m.messageId === messageId
        );
        toast({
          title: "Subject updated",
          description: `Subject for ${message?.match.first_name} ${message?.match.last_name} has been updated and saved.`,
        });
      } catch (error) {
        console.error("Error updating subject:", error);
        toast({
          title: "Update failed",
          description: "Failed to update subject. Please try again.",
          variant: "destructive",
        });
      } finally {
        // Remove from saving set
        setSavingMessageIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(messageId);
          return newSet;
        });
      }
    },
    [generatedMessages, toast, isMockMode]
  );

  const handleApproveMessage = useCallback(
    async (messageId: string) => {
      const message = generatedMessages.find((m) => m.messageId === messageId);
      const newApprovedStatus = !message?.approved;

      // Update local state immediately for better UX
      setGeneratedMessages((prev) =>
        prev.map((msg) =>
          msg.messageId === messageId
            ? { ...msg, approved: newApprovedStatus }
            : msg
        )
      );

      // Save to database if not in mock mode
      if (!isMockMode) {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session) {
            toast({
              title: "Authentication required",
              description: "Please log in to save changes.",
              variant: "destructive",
            });
            return;
          }

          console.log("Updating message approval:", {
            messageId,
            newApprovedStatus,
            userId: session.user.id
          });

          const { data, error } = await supabase
            .from("generated_messages")
            .update({
              approved: newApprovedStatus,
              updated_at: new Date().toISOString(),
            })
            .eq("id", messageId)
            .eq("user_id", session.user.id)
            .select();

          if (error) {
            console.error("Error updating approval status:", error);
            console.error("Error details:", {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            });
            toast({
              title: "Save failed",
              description: `Failed to save approval status: ${error.message}`,
              variant: "destructive",
            });
            return;
          }

          console.log("Update result:", { data, error });

          console.log("Successfully updated approval status to:", newApprovedStatus);
        } catch (error) {
          console.error("Error updating approval status:", error);
          toast({
            title: "Save failed",
            description: "Failed to save approval status. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: newApprovedStatus ? "Message approved" : "Message unapproved",
        description: `Message for ${message?.match.first_name} ${
          message?.match.last_name
        } has been ${newApprovedStatus ? "approved" : "unapproved"}.`,
      });
    },
    [generatedMessages, toast, isMockMode, supabase]
  );

  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      setGeneratedMessages((prev) =>
        prev.filter((msg) => msg.messageId !== messageId)
      );

      const message = generatedMessages.find((m) => m.messageId === messageId);
      toast({
        title: "Message deleted",
        description: `Message for ${message?.match.first_name} ${message?.match.last_name} has been deleted.`,
      });
    },
    [generatedMessages, toast]
  );

  const handleBulkApprove = useCallback(
    async (messageIds: string[]) => {
      // Update local state immediately for better UX
      setGeneratedMessages((prev) =>
        prev.map((msg) =>
          messageIds.includes(msg.messageId) ? { ...msg, approved: true } : msg
        )
      );

      // Save to database if not in mock mode
      if (!isMockMode) {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session) {
            toast({
              title: "Authentication required",
              description: "Please log in to save changes.",
              variant: "destructive",
            });
            return;
          }

          const { error } = await supabase
            .from("generated_messages")
            .update({
              approved: true,
              updated_at: new Date().toISOString(),
            })
            .in("id", messageIds)
            .eq("user_id", session.user.id);

          if (error) {
            console.error("Error updating approval status:", error);
            toast({
              title: "Save failed",
              description: "Failed to save approval status. Please try again.",
              variant: "destructive",
            });
            return;
          }
        } catch (error) {
          console.error("Error updating approval status:", error);
          toast({
            title: "Save failed",
            description: "Failed to save approval status. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Messages approved",
        description: `${messageIds.length} messages have been approved.`,
      });
    },
    [toast, isMockMode, supabase]
  );

  const handleBulkDelete = useCallback(
    (messageIds: string[]) => {
      setGeneratedMessages((prev) =>
        prev.filter((msg) => !messageIds.includes(msg.messageId))
      );

      toast({
        title: "Messages deleted",
        description: `${messageIds.length} messages have been deleted.`,
      });
    },
    [toast]
  );

  const onboardingData = onboardingService.getOnboardingData();
  const mentionJobInMessages = onboardingData?.mentionJobDirectly;

  const generateMessages = useCallback(
    async (customInstructions?: string, savedProspectIds?: string[]) => {
      try {
        if (isLimitReached("messages_generated")) return;

        setIsGeneratingMessages(true);
        setGenerationStartTime(Date.now());

        // Ensure customInstructions is a string or undefined
        const sanitizedInstructions =
          typeof customInstructions === "string"
            ? customInstructions
            : undefined;

        // Use mock data if in mock mode
        if (isMockMode) {
          const data = await unifiedWriteDataService.generateMessages(
            sanitizedInstructions
          );
          const { messages, dailyStats: stats } = data as {
            messages: GeneratedMessage[];
            dailyStats: { used: number; limit: number; remaining: number };
          };

          console.log("Mock mode - messages received:", messages.length);
          console.log("Existing messages count:", generatedMessages.length);

          // Apply the same merging logic as the live mode
          const enhancedMessages = messages.map((msg: GeneratedMessage) => ({
            ...msg,
            approved: false,
            messageType: "LinkedIn Connect" as const,
          }));

          const existingMessageIds = new Set(
            generatedMessages.map((msg) => msg.messageId)
          );
          const newMessagesToAdd = enhancedMessages.filter(
            (msg: GeneratedMessage) => !existingMessageIds.has(msg.messageId)
          );
          const allMessages = [...generatedMessages, ...newMessagesToAdd];

          console.log(
            "Mock mode - new messages to add:",
            newMessagesToAdd.length
          );
          console.log(
            "Mock mode - total messages after merge:",
            allMessages.length
          );

          setGeneratedMessages(allMessages);
          setDailyStats(stats);

          // Auto-select all new unapproved messages
          const unapprovedMessageIds = allMessages
            .filter((msg) => !msg.approved)
            .map((msg) => msg.messageId);
          setSelectedMessages(unapprovedMessageIds);

          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          toast({
            title: "Authentication required",
            description: "Please log in to generate messages.",
            variant: "destructive",
          });
          return;
        }

        // Use streaming approach for better UX
        const { data } = await supabase.auth.getSession();
        const authToken = data.session?.access_token;

        if (!authToken) {
          throw new Error("No auth token available");
        }

        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/generate-messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              customInstructions: sanitizedInstructions,
              prospectIds: savedProspectIds,
              mentionJobInMessages,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No response body");
        }

        let newMessagesReceived = 0;
        let finalStats = { used: 0, limit: 10, remaining: 10 };
        let newMessagesGenerated = 0;
        const receivedMessages: GeneratedMessage[] = [];

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const jsonString = line.slice(6).trim();
                  if (!jsonString) continue;
                  const data = JSON.parse(jsonString);

                  if (data.type === "status") {
                    // Update generation progress
                    setGenerationProgress({
                      total: data.total || 0,
                      generated: data.generated || 0,
                      remaining: data.remaining || 0,
                    });
                  } else if (data.type === "message") {
                    const enhancedMessage = {
                      prospect: data.prospect,
                      match: data.match,
                      message: data.messageContent,
                      subject: data.messageSubject,
                      messageId: data.messageId,
                      approved: false,
                      messageType: "LinkedIn Connect" as const,
                    };

                    receivedMessages.push(enhancedMessage);
                    newMessagesReceived++;

                    // Update UI incrementally
                    setGeneratedMessages((prev) => {
                      const existingIds = new Set(
                        prev.map((msg) => msg.messageId)
                      );
                      if (!existingIds.has(enhancedMessage.messageId)) {
                        return [...prev, enhancedMessage];
                      }
                      return prev;
                    });
                  } else if (data.type === "complete") {
                    finalStats = data.dailyStats || finalStats;
                    newMessagesGenerated = data.newMessagesGenerated || 0;
                    // Reset progress when complete
                    setGenerationProgress({
                      total: 0,
                      generated: 0,
                      remaining: 0,
                    });
                  }
                } catch (e) {
                  console.warn("Failed to parse SSE data:", e);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        console.log(
          "Streaming complete - messages received:",
          newMessagesReceived
        );

        setDailyStats(finalStats);

        // Auto-select all new unapproved messages
        setGeneratedMessages((current) => {
          const unapprovedMessageIds = current
            .filter((msg) => !msg.approved)
            .map((msg) => msg.messageId);
          setSelectedMessages(unapprovedMessageIds);
          return current;
        });
      } catch (error) {
        console.error("Error generating messages:", error);
        toast({
          title: "Generation failed",
          description:
            error.message || "Failed to generate messages. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsGeneratingMessages(false);
        setGenerationStartTime(null);
      }
    },
    [profileData, mentionJobInMessages]
  );

  const regenerateSelectedMessagesWithAI = useCallback(
    async ({
      customInstructions,
      messageIds,
      autoGenerate = false,
    }: {
      customInstructions?: string;
      messageIds: string[];
      autoGenerate?: boolean;
    }) => {
      try {
        // Add all message IDs to regenerating set to show loading state
        setRegeneratingMessageIds((prev) => {
          const newSet = new Set(prev);
          messageIds.forEach((id) => newSet.add(id));
          return newSet;
        });

        // Ensure customInstructions is a string or undefined
        const sanitizedInstructions =
          typeof customInstructions === "string"
            ? customInstructions
            : undefined;

        // Use mock data if in mock mode
        if (isMockMode) {
          toast({
            title: "Not available in mock mode",
            description: "This feature is not available in mock mode.",
          });
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          toast({
            title: "Authentication required",
            description: "Please log in to generate messages.",
            variant: "destructive",
          });
          return;
        }

        // Use direct fetch to handle streaming response
        const fetchResponse = await fetch(
          `${SUPABASE_URL}/functions/v1/regenerate-message`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session?.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              autoGenerate,
              feedback: sanitizedInstructions || "",
              messageIds,
              mentionJobInMessages,
              customInstructions: sanitizedInstructions,
            }),
          }
        );

        if (!fetchResponse.ok) {
          throw new Error(`HTTP error! status: ${fetchResponse.status}`);
        }

        // Handle streaming response
        const reader = fetchResponse.body?.getReader();
        const decoder = new TextDecoder();
        const messages: GeneratedMessage[] = [];
        let dailyStats: { used: number; limit: number; remaining: number } = {
          used: 0,
          limit: 10,
          remaining: 10,
        };

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n").filter((line) => line.trim());

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const jsonString = line.slice(6).trim();
                  if (!jsonString) continue;
                  const data = JSON.parse(jsonString);

                  if (data.type === "message") {
                    messages.push(data);

                    // Update UI incrementally for the regenerated message
                    setGeneratedMessages((prev) =>
                      prev.map((msg) =>
                        msg.messageId === data.messageId
                          ? {
                              ...msg,
                              message: data.message || data.messageContent,
                              subject: data.subject || data.messageSubject,
                              approved: msg.approved,
                              messageType: msg.messageType,
                            }
                          : msg
                      )
                    );

                    // Remove this message from regenerating set since it's complete
                    setRegeneratingMessageIds((prev) => {
                      const newSet = new Set(prev);
                      newSet.delete(data.messageId);
                      return newSet;
                    });
                  } else if (data.type === "complete") {
                    dailyStats = data.dailyStats;
                  }
                } catch (e) {
                  console.warn(
                    "Failed to parse regeneration SSE data:",
                    e,
                    "Line:",
                    line
                  );
                }
              }
            }
          }
        }

        setDailyStats(dailyStats);

        toast({
          title: "Messages regenerated!",
          description: `Regeneration complete! Please review the regenerated messages.`,
        });
      } catch (error) {
        console.error("Error generating messages:", error);
        toast({
          title: "Generation failed",
          description:
            error.message || "Failed to generate messages. Please try again.",
          variant: "destructive",
        });
      } finally {
        // Remove any remaining message IDs from regenerating set (in case of errors)
        setRegeneratingMessageIds((prev) => {
          const newSet = new Set(prev);
          messageIds.forEach((id) => newSet.delete(id));
          return newSet;
        });
      }
    },
    [
      isMockMode,
      toast,
      setGeneratedMessages,
      setDailyStats,
      mentionJobInMessages,
    ]
  );

  const handleRegenerateMessages = useCallback(
    async (
      customization: MessageCustomization,
      autoGenerate: boolean = false
    ) => {
      setIsRegenerating(true);
      await regenerateSelectedMessagesWithAI({
        customInstructions: customization.instructions,
        messageIds: customization.selectedMessages || [],
        autoGenerate,
      });
      setIsRegenerating(false);
    },
    [regenerateSelectedMessagesWithAI, mentionJobInMessages]
  );

  const handleClearSelection = useCallback(() => {
    setSelectedMessages([]);
  }, [setSelectedMessages]);

  const handleToggleApproved = useCallback(() => {
    setShowApproved((prev) => {
      const newShowApproved = !prev;
      // Auto-select all messages in the new view
      if (newShowApproved) {
        const approvedMessageIds = generatedMessages
          .filter((msg) => msg.approved)
          .map((msg) => msg.messageId);
        setSelectedApprovedMessages(approvedMessageIds);
        setSelectedMessages([]); // Clear unapproved selection
      } else {
        const unapprovedMessageIds = generatedMessages
          .filter((msg) => !msg.approved)
          .map((msg) => msg.messageId);
        setSelectedMessages(unapprovedMessageIds);
        setSelectedApprovedMessages([]); // Clear approved selection
      }
      return newShowApproved;
    });
  }, [setShowApproved, generatedMessages, setSelectedMessages]);

  const handleUnapproveMessage = useCallback(
    async (messageId: string) => {
      const message = generatedMessages.find((m) => m.messageId === messageId);
      
      // Update local state immediately for better UX
      setGeneratedMessages((prev) =>
        prev.map((msg) =>
          msg.messageId === messageId ? { ...msg, approved: false } : msg
        )
      );
      // Remove from selected approved messages
      setSelectedApprovedMessages((prev) =>
        prev.filter((id) => id !== messageId)
      );

      // Save to database if not in mock mode
      if (!isMockMode) {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session) {
            toast({
              title: "Authentication required",
              description: "Please log in to save changes.",
              variant: "destructive",
            });
            return;
          }

          console.log("Unapproving message:", {
            messageId,
            userId: session.user.id
          });

          const { data, error } = await supabase
            .from("generated_messages")
            .update({
              approved: false,
              updated_at: new Date().toISOString(),
            })
            .eq("id", messageId)
            .eq("user_id", session.user.id)
            .select();

          if (error) {
            console.error("Error unapproving message:", error);
            console.error("Error details:", {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            });
            toast({
              title: "Save failed",
              description: `Failed to save unapproval: ${error.message}`,
              variant: "destructive",
            });
            return;
          }

          console.log("Unapprove result:", { data, error });
          console.log("Successfully unapproved message");
        } catch (error) {
          console.error("Error unapproving message:", error);
          toast({
            title: "Save failed",
            description: "Failed to save unapproval. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Message unapproved",
        description: `Message for ${message?.match.first_name} ${message?.match.last_name} has been moved back to drafts.`,
      });
    },
    [generatedMessages, toast, setGeneratedMessages, isMockMode, supabase]
  );

  const handleBulkUnapprove = useCallback(
    async (messageIds: string[]) => {
      // Update local state immediately for better UX
      setGeneratedMessages((prev) =>
        prev.map((msg) =>
          messageIds.includes(msg.messageId) ? { ...msg, approved: false } : msg
        )
      );
      setSelectedApprovedMessages([]);

      // Save to database if not in mock mode
      if (!isMockMode) {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session) {
            toast({
              title: "Authentication required",
              description: "Please log in to save changes.",
              variant: "destructive",
            });
            return;
          }

          console.log("Bulk unapproving messages:", {
            messageIds,
            userId: session.user.id
          });

          const { data, error } = await supabase
            .from("generated_messages")
            .update({
              approved: false,
              updated_at: new Date().toISOString(),
            })
            .in("id", messageIds)
            .eq("user_id", session.user.id)
            .select();

          if (error) {
            console.error("Error bulk unapproving messages:", error);
            console.error("Error details:", {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            });
            toast({
              title: "Save failed",
              description: `Failed to save unapprovals: ${error.message}`,
              variant: "destructive",
            });
            return;
          }

          console.log("Bulk unapprove result:", { data, error });
          console.log(`Successfully unapproved ${messageIds.length} messages`);
        } catch (error) {
          console.error("Error bulk unapproving messages:", error);
          toast({
            title: "Save failed",
            description: "Failed to save unapprovals. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Messages unapproved",
        description: `${messageIds.length} messages have been moved back to drafts.`,
      });
    },
    [toast, setGeneratedMessages, isMockMode, supabase]
  );

  const handleClearApprovedSelection = useCallback(() => {
    setSelectedApprovedMessages([]);
  }, []);

  const handleSelectMessages = (messageIds: string[]) => {
    setSelectedMessages(messageIds);
    // Clear approved selection when selecting unapproved messages (mutual exclusion)
    if (messageIds.length > 0) {
      setSelectedApprovedMessages([]);
    }
  };

  const handleSelectApprovedMessages = (messageIds: string[]) => {
    setSelectedApprovedMessages(messageIds);
    // Clear unapproved selection when selecting approved messages (mutual exclusion)
    if (messageIds.length > 0) {
      setSelectedMessages([]);
    }
  };

  // Filter messages by approval status
  const unapprovedMessages = generatedMessages.filter((msg) => !msg.approved);
  const approvedMessages = generatedMessages.filter((msg) => msg.approved);

  return (
    <div className="space-y-6 pb-64">
      {/* Simplified Management Box */}
      <SimpleManagementBox
        profileData={profileData}
        onGenerateMessages={() => generateMessages()}
        isGenerating={isGeneratingMessages}
        messageCount={generatedMessages.length}
        generationProgress={generationProgress}
        isPolling={isPolling}
      />

      {/* Messages Table - Only showing unapproved messages */}
      {unapprovedMessages.length > 0 && (
        <MessageTable
          messages={unapprovedMessages}
          onEdit={handleEditMessage}
          onEditSubject={handleEditSubject}
          onApprove={handleApproveMessage}
          onDelete={handleDeleteMessage}
          onBulkApprove={handleBulkApprove}
          onBulkDelete={handleBulkDelete}
          selectedMessages={selectedMessages}
          onSelectedMessagesChange={handleSelectMessages}
          onClearSelection={() => setSelectedMessages([])}
          isGenerating={isGeneratingMessages}
          regeneratingMessageIds={regeneratingMessageIds}
          savingMessageIds={savingMessageIds}
        />
      )}

      {/* Show Approved Button - Only show when there are approved messages */}
      {approvedMessages.length > 0 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleToggleApproved}
            className="flex items-center gap-2"
          >
            {showApproved ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {showApproved ? "Hide" : "Show"} Approved ({approvedMessages.length}
            )
          </Button>
        </div>
      )}

      {/* Approved Messages Table - Only show when toggled on */}
      {showApproved && approvedMessages.length > 0 && (
        <ApprovedMessagesTable
          approvedMessages={approvedMessages}
          onUnapproveMessage={handleUnapproveMessage}
          onBulkUnapprove={handleBulkUnapprove}
          selectedMessages={selectedApprovedMessages}
          onSelectedMessagesChange={handleSelectApprovedMessages}
          onClearSelection={handleClearApprovedSelection}
        />
      )}

      {/* Always show FloatingActionBar for AI Message Assistant */}
      <FloatingActionBar
        selectedMessages={
          selectedMessages.length > 0
            ? selectedMessages
            : selectedApprovedMessages
        }
        messageCount={
          selectedMessages.length > 0
            ? selectedMessages.length
            : selectedApprovedMessages.length
        }
        onBulkApprove={handleBulkApprove}
        onBulkUnapprove={handleBulkUnapprove}
        onClearSelection={
          selectedMessages.length > 0
            ? handleClearSelection
            : handleClearApprovedSelection
        }
        onRegenerateWithAI={
          selectedMessages.length > 0
            ? async (instructions, messageIds) => {
                const autoGenerate =
                  !instructions || instructions.trim() === "";
                await handleRegenerateMessages(
                  {
                    instructions,
                    selectedMessages: messageIds,
                  },
                  autoGenerate
                );
              }
            : undefined
        }
        onRegenerateMessagesFromHighlights={async (instructions) => {
          await generateMessages(instructions);
        }}
        onEditManually={
          selectedMessages.length > 0
            ? (messageIds) => {
                const messagesToEdit = [
                  ...generatedMessages,
                  ...approvedMessages,
                ].filter((msg) => messageIds.includes(msg.messageId));
                setEditingMessages(messagesToEdit);
                const initialContent: Record<string, string> = {};
                const initialSubjects: Record<string, string> = {};
                messagesToEdit.forEach((msg) => {
                  initialContent[msg.messageId] = msg.message;
                  initialSubjects[msg.messageId] = msg.subject || "";
                });
                setEditContent(initialContent);
                setEditSubjects(initialSubjects);
                setEditModalOpen(true);
              }
            : undefined
        }
        isRegenerating={isRegenerating}
        isGeneratingMessages={isGeneratingMessages}
        messageType={selectedMessages.length > 0 ? "unapproved" : "approved"}
        disableTextArea={isRegenerating || isGeneratingMessages}
      />

      {/* Edit Messages Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Messages</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {editingMessages.map((message) => (
              <div
                key={message.messageId}
                className="space-y-3 p-4 border rounded-lg"
              >
                <Label className="text-sm font-medium">
                  {message.prospect.company} - {message.match.first_name}{" "}
                  {message.match.last_name}
                </Label>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Subject Line
                  </Label>
                  <Input
                    value={editSubjects[message.messageId] || ""}
                    onChange={(e) =>
                      setEditSubjects((prev) => ({
                        ...prev,
                        [message.messageId]: e.target.value,
                      }))
                    }
                    placeholder="Enter subject line..."
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Message Content
                  </Label>
                  <Textarea
                    value={editContent[message.messageId] || ""}
                    onChange={(e) =>
                      setEditContent((prev) => ({
                        ...prev,
                        [message.messageId]: e.target.value,
                      }))
                    }
                    rows={4}
                    className="min-h-[100px]"
                    placeholder="Enter message content..."
                  />
                </div>
              </div>
            ))}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setEditModalOpen(false);
                  setEditContent({});
                  setEditSubjects({});
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  // Get current session
                  const {
                    data: { session },
                  } = await supabase.auth.getSession();
                  if (!session) {
                    toast({
                      title: "Authentication required",
                      description: "Please log in to save changes.",
                      variant: "destructive",
                    });
                    return;
                  }

                  // Update messages with edited content and subjects
                  const updatedMessages = generatedMessages.map((msg) => {
                    const hasContentEdit =
                      editContent[msg.messageId] &&
                      editContent[msg.messageId] !== msg.message;
                    const hasSubjectEdit =
                      editSubjects[msg.messageId] !== undefined &&
                      editSubjects[msg.messageId] !== msg.subject;

                    if (hasContentEdit || hasSubjectEdit) {
                      return {
                        ...msg,
                        message: editContent[msg.messageId] || msg.message,
                        subject:
                          editSubjects[msg.messageId] !== undefined
                            ? editSubjects[msg.messageId]
                            : msg.subject,
                      };
                    }
                    return msg;
                  });

                  setGeneratedMessages(updatedMessages);

                  // Update in database if not mock mode
                  if (!isMockMode) {
                    for (const messageId of Object.keys(editContent)) {
                      const updateData: any = {};

                      if (editContent[messageId]) {
                        updateData.message_content = editContent[messageId];
                      }

                      if (editSubjects[messageId] !== undefined) {
                        // Get current message detail and update subject
                        const currentMessage = await supabase
                          .from("generated_messages")
                          .select("detail")
                          .eq("id", messageId)
                          .eq("user_id", session.user.id)
                          .single();

                        const currentDetail =
                          (currentMessage?.data as any)?.detail || {};
                        updateData.detail = {
                          ...currentDetail,
                          subject: editSubjects[messageId],
                        };
                      }

                      if (Object.keys(updateData).length > 0) {
                        await supabase
                          .from("generated_messages")
                          .update(updateData)
                          .eq("id", messageId);
                      }
                    }
                  }

                  setEditModalOpen(false);
                  setEditContent({});
                  setEditSubjects({});
                  toast({ title: "Messages updated successfully" });
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateModule;
