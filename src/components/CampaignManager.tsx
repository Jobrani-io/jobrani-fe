import { Search, Database, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { useCampaigns } from "@/hooks/useCampaigns";

interface CampaignManagerProps {
  triggerWaitlistPopup?: () => void;
}

const CampaignManager = ({ triggerWaitlistPopup }: CampaignManagerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const { campaigns, updateCampaignName } = useCampaigns();

  // Helper functions for campaign management
  const getTimeColor = (timeAgo: string) => {
    if (timeAgo.includes("day")) {
      const days = parseInt(timeAgo);
      if (days <= 2) return "text-green-600";
      if (days <= 7) return "text-yellow-600";
      return "text-red-600";
    }
    if (timeAgo.includes("week")) {
      return "text-yellow-600";
    }
    return "text-muted-foreground";
  };

  const getCampaignTypeColor = (type: string) => {
    return type === 'Self-Apply' 
      ? 'bg-green-50 text-green-700 border border-green-200' 
      : 'bg-gradient-to-r from-orange-500 to-blue-500 text-white border-0';
  };

  const handleEditCampaign = (campaignName: string) => {
    console.log(`Editing campaign: ${campaignName}`);
  };

  const handleDoubleClick = (campaign: any) => {
    setEditingId(campaign.id);
    setEditingName(campaign.name);
  };

  const handleNameSave = () => {
    if (editingId && editingName.trim()) {
      updateCampaignName(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName("");
  };

  const handleNameCancel = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  };

  return (
    <Card className="border shadow-card">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">My Launched Campaigns</CardTitle>
        <p className="text-muted-foreground">
          Manage your launched campaigns and track their progress.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Campaign Management - Table-based campaign management */}
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Jobs</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns
                .filter(campaign => 
                  campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((campaign) => (
                  <TableRow key={campaign.id} className="group">
                    <TableCell className="font-medium">
                      {editingId === campaign.id ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={handleNameSave}
                          onKeyDown={handleKeyDown}
                          className="w-full"
                          autoFocus
                        />
                      ) : (
                        <span 
                          onDoubleClick={() => handleDoubleClick(campaign)}
                          className="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
                        >
                          {campaign.name}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getCampaignTypeColor(campaign.campaignType)}>
                        {campaign.campaignType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-semibold">
                        {campaign.jobCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${getTimeColor(campaign.createdDate)}`}>
                        {campaign.createdDate}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={campaign.campaignStatus === 'Live' ? 'default' : 'secondary'}
                          className={campaign.campaignStatus === 'Live' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                        >
                          {campaign.campaignStatus}
                        </Badge>
                        <Edit 
                          className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity ml-2" 
                          onClick={() => triggerWaitlistPopup?.()}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        {campaigns.filter(campaign => 
          campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).length === 0 && (
          <div className="text-center py-8">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No campaigns found matching your search.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CampaignManager;