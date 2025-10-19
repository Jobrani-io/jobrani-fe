import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import DraftedApplicationsTable from "./applications/DraftedApplicationsTable";
import ReadyApplicationsTable from "./applications/ReadyApplicationsTable";
import ApplicationsSentTable from "./applications/ApplicationsSentTable";
import ApplicationMaterialsReviewModal from "./ApplicationMaterialsReviewModal";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  type JobApplication,
  useApplications,
} from "@/contexts/ApplicationsContext";
import { type LaunchedApplication } from "@/hooks/useLaunchedApplications";

const ApplicationsManager = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [materialsModalApplication, setMaterialsModalApplication] = useState<
    JobApplication | LaunchedApplication
  >(null);
  const [selectedApplication, setSelectedApplication] = useState<
    LaunchedApplication | JobApplication | null
  >(null);

  const { draftedApps, readyApps, sentApps, loading, refetch, moveToSent } =
    useApplications();
  const { isLimitReached } = useSubscription();

  const [activeTab, setActiveTab] = useState<string>("ready"); // Default to ready

  // Set default tab based on application availability after data loads
  useEffect(() => {
    if (!loading) {
      if (readyApps.length > 0) {
        setActiveTab("ready");
      } else if (draftedApps.length > 0) {
        setActiveTab("drafted");
      } else {
        setActiveTab("sent");
      }
    }
  }, [readyApps.length, draftedApps.length, sentApps.length, loading]);

  const handleMaterialsReview = (
    application: LaunchedApplication | JobApplication
  ) => {
    setSelectedApplication(application);
    setMaterialsModalApplication(application);
  };

  const handleFinishApplication = (jobId: string) => {
    // Navigate to the appropriate module based on what's missing
    // For now, just show an alert - in production this would route to modules
    alert(`Navigating to complete application for job: ${jobId}`);
  };

  const handleApplyForMe = async (job: JobApplication) => {
    try {
      if (isLimitReached("outreach_sent")) return;

      const { error } = await supabase.from("launched_applications").insert({
        user_id: job.user_id,
        prospect_id: job.prospect_id,
        match_id: job.match_id,
        resume_id: job.resume_id,
        messages: job.messages,
        campaign_type: "apply-for-me",
        workflow_sequence: job.campaign_strategy.map((key) => ({ key })),
      });

      if (error) throw error;
      moveToSent(job.job_id);
      refetch({ silent: true });
      toast.success("Application sent");
    } catch (error) {
      console.log(error);
      toast.error("Failed to launch application");
    }
  };

  // Filter applications based on current tab and search query
  const filteredSentApplications = sentApps.filter(
    (app) =>
      app.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.match_name &&
        app.match_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredDraftedApplications = draftedApps.filter(
    (app) =>
      app.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.match_name &&
        app.match_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredReadyApplications = readyApps.filter(
    (app) =>
      app.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.match_name &&
        app.match_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <Card className="border shadow-card">
        <CardContent className="flex items-center justify-center py-8">
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <Card className="border shadow-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search applications by job title, company, or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Application Lifecycle Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted p-1 rounded-lg">
          <TabsTrigger
            value="drafted"
            className="relative data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
          >
            Drafted Applications
            {draftedApps.length > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                {draftedApps.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="ready"
            className="relative data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
          >
            Ready Applications
            {readyApps.length > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                {readyApps.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="sent"
            className="relative data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
          >
            Applications Sent
            {sentApps.length > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                {sentApps.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drafted" className="mt-6">
          <DraftedApplicationsTable
            applications={filteredDraftedApplications}
            onFinishApplication={handleFinishApplication}
            onReviewMaterials={handleMaterialsReview}
          />
        </TabsContent>

        <TabsContent value="ready" className="mt-6">
          <ReadyApplicationsTable
            applications={filteredReadyApplications}
            onApplyForMe={handleApplyForMe}
            onReviewMaterials={handleMaterialsReview}
          />
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          <ApplicationsSentTable
            applications={filteredSentApplications}
            onReviewMaterials={handleMaterialsReview}
          />
        </TabsContent>
      </Tabs>

      {selectedApplication && (
        <ApplicationMaterialsReviewModal
          app={materialsModalApplication}
          onClose={() => setMaterialsModalApplication(null)}
        />
      )}
    </div>
  );
};

export { ApplicationsManager };
export default ApplicationsManager;
