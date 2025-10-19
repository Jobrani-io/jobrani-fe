import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, Calendar, Target, TrendingUp } from 'lucide-react';

interface CampaignSummaryCardProps {
  totalContacts: number;
  totalMessages: number;
  estimatedDuration: string;
  completionRate: number;
  readyToLaunch: number;
  needsAttention: number;
}

export const CampaignSummaryCard = ({
  totalContacts,
  totalMessages,
  estimatedDuration,
  completionRate,
  readyToLaunch,
  needsAttention
}: CampaignSummaryCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Campaign Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Contacts</span>
            </div>
            <div className="text-2xl font-bold text-primary">{totalContacts}</div>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Messages</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{totalMessages}</div>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Timeline</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{estimatedDuration}</div>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Ready</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
          </div>
        </div>

        <div className="flex gap-2 justify-center">
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            {readyToLaunch} Ready to Launch
          </Badge>
          {needsAttention > 0 && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
              {needsAttention} Need Attention
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};