import React, { useState, useEffect } from "react";
import {
  X,
  Users,
  Target,
  Crown,
  UserCheck,
  Link,
  ExternalLink,
  Chrome,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import savedProspectsService, {
  SavedProspect,
  JobMatch,
} from "@/services/savedProspectsService";
import { useExtensionDetection } from "@/hooks/useExtensionDetection";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface ContactSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: SavedProspect | null;
  onSelectContact: (jobId: string, contact: JobMatch) => void;
  onMatchesUpdated?: () => void;
}

const ContactSelectionModal = ({
  isOpen,
  onClose,
  job,
  onSelectContact,
  onMatchesUpdated,
}: ContactSelectionModalProps) => {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null
  );
  const [customContactLink, setCustomContactLink] = useState<string>("");
  const [customContactName, setCustomContactName] = useState<string>("");
  const [customContactTitle, setCustomContactTitle] = useState<string>("");
  const [isSavingCustomContact, setIsSavingCustomContact] =
    useState<boolean>(false);
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState<boolean>(false);
  const { isExtensionConnected, installExtension } = useExtensionDetection();

  // Fetch matches from prospect_matches table
  const fetchMatches = async (prospectId: string) => {
    if (!prospectId) return;

    setIsLoadingMatches(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existingMatch, error } = await supabase
        .from("prospect_matches")
        .select("matches")
        .eq("job_id", prospectId)
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      const existingMatches = (existingMatch?.matches as unknown as JobMatch[]) || [];
      setMatches(existingMatches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      setMatches([]);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  // Fetch matches when modal opens or job changes
  useEffect(() => {
    if (isOpen && job?.prospect_id) {
      fetchMatches(job.prospect_id);
      // Reset form when modal opens
      setSelectedContactId(null);
      setCustomContactName("");
      setCustomContactTitle("");
      setCustomContactLink("");
    }
  }, [isOpen, job?.prospect_id]);

  console.log({ matches });

  if (!job) return null;

  const validateLinkedInUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/(in|pub)\/.+/;
    return linkedinPattern.test(url.trim());
  };

  const handleSelectContact = () => {
    if (!selectedContactId && !isCustomContactValid()) return;

    if (isCustomContactValid()) {
      // Create a custom contact from the form
      const customContact: JobMatch = {
        name: customContactName.trim(),
        title: customContactTitle.trim(),
        confidence: 1,
        linkedin_url: customContactLink.trim(),
        reason: "Custom contact added manually",
      };
      onSelectContact(job.prospect_id, customContact);
    } else {
      const contact = matches.find((c) => c.name === selectedContactId);
      if (contact) {
        onSelectContact(job.prospect_id, contact);
      }
    }
    onClose();
  };

  const isCustomContactValid = (): boolean => {
    return (
      customContactName.trim() !== "" &&
      customContactTitle.trim() !== "" &&
      validateLinkedInUrl(customContactLink)
    );
  };

  const handleSaveCustomContact = async () => {
    if (!job || !isCustomContactValid()) return;

    setIsSavingCustomContact(true);
    try {
      const customContact: JobMatch = {
        name: customContactName.trim(),
        title: customContactTitle.trim(),
        confidence: 1,
        linkedin_url: customContactLink.trim(),
        reason: "Custom contact added manually",
      };

      const success = await savedProspectsService.addCustomContactToMatches(
        job.prospect_id,
        customContact
      );

      if (success) {
        // Clear the form
        setCustomContactName("");
        setCustomContactTitle("");
        setCustomContactLink("");

        // Immediately refresh matches in the modal
        await fetchMatches(job.prospect_id);

        // Trigger a refresh of matches in the parent component
        onMatchesUpdated?.();
      }
    } catch (error) {
      console.error("Error saving custom contact:", error);
    } finally {
      setIsSavingCustomContact(false);
    }
  };

  const getContactIcon = () => {
    return <Crown className="h-4 w-4" />;
  };

  const getMatchScoreColor = (score: number) => {
    return "bg-muted text-muted-foreground";
  };

  const renderContactCard = (contact: JobMatch) => (
    <div
      key={contact.name}
      className={`group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer hover:shadow-elegant ${
        selectedContactId === contact.name
          ? "border-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg"
          : "border-border hover:border-primary/50 hover:bg-gradient-to-br hover:from-background hover:to-muted/30"
      } bg-gradient-to-br from-warning/5 to-warning/10`}
      onClick={() => setSelectedContactId(contact.name)}
    >
      {/* Match Score Badge */}
      <div
        className={`absolute top-4 right-4 w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold ${getMatchScoreColor(
          contact.confidence * 100
        )}`}
      >
        {contact.confidence * 100}%
      </div>

      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            {/* Name and Type */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <h5 className="font-semibold text-base truncate">
                  {contact.name}
                </h5>
                {contact.linkedin_url && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(contact.linkedin_url, "_blank");
                    }}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={`Open ${contact.name}'s LinkedIn profile`}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </button>
                )}
              </div>
              <Badge className="bg-warning/20 text-warning-foreground border-warning/30">
                <Crown className="h-3 w-3 mr-1" />
                Hiring Manager
              </Badge>
            </div>

            {/* Title */}
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              {contact.title}
            </p>

            {/* Stats Row */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {contact.confidence * 100}% confidence
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground mt-2">
              {contact.reason}
            </p>
          </div>
        </div>
      </div>

      {/* Selection Indicator */}
      {selectedContactId === contact.name && (
        <div className="absolute inset-0 border-2 border-primary rounded-xl pointer-events-none" />
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            Select Contact for {job.company}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-8 pr-2">
            {/* Job Info Card */}
            <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl p-6 border">
              <h3 className="font-semibold text-lg mb-2">{job.job_title}</h3>
              <p className="text-muted-foreground">
                {job.company} • {job.location}
              </p>
            </div>

            {/* Hiring Managers Grid */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Crown className="h-4 w-4 text-warning-foreground" />
                </div>
                <h4 className="font-semibold text-lg">Hiring Managers</h4>
                {!isLoadingMatches && (
                  <Badge variant="secondary" className="text-xs">
                    {matches.length} contact{matches.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>

              {isLoadingMatches ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">
                    Loading matches...
                  </div>
                </div>
              ) : matches.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {matches.map((contact) => renderContactCard(contact))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No matches found. Add a custom contact below.
                </div>
              )}
            </div>

            {/* Custom Contact Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Link className="h-4 w-4 text-primary" />
                </div>
                <h4 className="font-semibold text-lg">Add Custom Contact</h4>
              </div>

              <div className="bg-gradient-to-br from-background to-muted/30 rounded-xl p-6 border">
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="contact-name"
                      className="text-sm font-medium"
                    >
                      Contact Name *
                    </Label>
                    <Input
                      id="contact-name"
                      placeholder="John Smith"
                      value={customContactName}
                      onChange={(e) => setCustomContactName(e.target.value)}
                      className="w-full h-12 text-base mt-2"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="contact-title"
                      className="text-sm font-medium"
                    >
                      Job Title *
                    </Label>
                    <Input
                      id="contact-title"
                      placeholder="Senior Software Engineer"
                      value={customContactTitle}
                      onChange={(e) => setCustomContactTitle(e.target.value)}
                      className="w-full h-12 text-base mt-2"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="contact-link"
                      className="text-sm font-medium"
                    >
                      LinkedIn Profile URL *
                    </Label>
                    <Input
                      id="contact-link"
                      placeholder="https://linkedin.com/in/contact-name"
                      value={customContactLink}
                      onChange={(e) => setCustomContactLink(e.target.value)}
                      className={`w-full h-12 text-base mt-2 ${
                        customContactLink.trim() &&
                        !validateLinkedInUrl(customContactLink)
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                    />
                    {customContactLink.trim() &&
                      !validateLinkedInUrl(customContactLink) && (
                        <p className="text-xs text-red-500 mt-1">
                          Please enter a valid LinkedIn profile URL
                        </p>
                      )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Enter the contact details for the person you want to reach
                    out to
                    {!isExtensionConnected && (
                      <span className="inline-flex items-center gap-1 ml-1">
                        or use your
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={installExtension}
                          className="h-6 px-2 text-xs inline-flex items-center gap-1"
                        >
                          <Chrome className="h-3 w-3" />
                          Chrome Extension
                        </Button>
                        to search on LinkedIn
                      </span>
                    )}
                  </div>

                  {isCustomContactValid() && (
                    <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-primary">
                            <UserCheck className="h-4 w-4" />
                            Custom contact ready
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {customContactName} • {customContactTitle}
                          </p>
                        </div>
                        <Button
                          onClick={handleSaveCustomContact}
                          disabled={isSavingCustomContact}
                          size="sm"
                          className="text-xs h-8"
                        >
                          {isSavingCustomContact ? "Saving..." : "Save Contact"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t bg-background">
          <Button variant="outline" onClick={onClose} className="flex-1 h-12">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSelectContact}
            disabled={!selectedContactId && !isCustomContactValid()}
            className="flex-1 h-12 font-semibold"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Select Contact
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactSelectionModal;
