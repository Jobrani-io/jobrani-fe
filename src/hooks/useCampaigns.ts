import { useState } from 'react';

export interface Campaign {
  id: string;
  name: string;
  jobCount: number;
  createdDate: string;
  isLive: boolean;
  campaignStatus: 'Live' | 'Complete';
  campaignType: 'Self-Apply' | 'Apply For Me';
}

const initialCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Campaign 1',
    jobCount: 247,
    createdDate: '2 hours ago',
    isLive: true,
    campaignStatus: 'Live',
    campaignType: 'Self-Apply'
  },
  {
    id: '2',
    name: 'Campaign 2',
    jobCount: 156,
    createdDate: '1 day ago',
    isLive: false,
    campaignStatus: 'Complete',
    campaignType: 'Apply For Me'
  },
  {
    id: '3',
    name: 'Campaign 3',
    jobCount: 89,
    createdDate: '3 days ago',
    isLive: true,
    campaignStatus: 'Live',
    campaignType: 'Self-Apply'
  },
  {
    id: '4',
    name: 'Campaign 4',
    jobCount: 203,
    createdDate: '5 days ago',
    isLive: false,
    campaignStatus: 'Complete',
    campaignType: 'Apply For Me'
  },
  {
    id: '5',
    name: 'Campaign 5',
    jobCount: 134,
    createdDate: '1 week ago',
    isLive: true,
    campaignStatus: 'Live',
    campaignType: 'Self-Apply'
  }
];

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  
  const updateCampaignName = (id: string, newName: string) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === id ? { ...campaign, name: newName } : campaign
    ));
  };
  
  return {
    campaigns,
    getCampaignById: (id: string) => campaigns.find(campaign => campaign.id === id),
    updateCampaignName,
  };
};