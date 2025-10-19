import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { X, Clock, GitBranch, Settings, ChevronUp, ChevronDown, UserPlus, Mail, Eye, MessageSquare, Heart, Send, HelpCircle, Users, Globe, Sparkles, Filter, FileText, Bell } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { messageGenerator } from '@/services/messageGenerator';

// Icon mapping
const iconMap = {
  UserPlus,
  Mail,
  Eye,
  MessageSquare,
  Heart,
  Send,
  Filter,
  FileText,
  Bell,
};

interface EnhancedActionNodeProps {
  id: string;
  data: {
    label: string;
    description?: string;
    color?: string;
    icon?: string;
    originalType?: string;
    waitEnabled?: boolean;
    waitPeriod?: string;
    noResponseEnabled?: boolean;
    noResponseAction?: string;
    messageType?: 'message' | 'inmail';
    execHiringManagerEnabled?: boolean;
    peerEnabled?: boolean;
    recruiterEnabled?: boolean;
  };
}

const EnhancedActionNode: React.FC<EnhancedActionNodeProps> = ({ id, data }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMessagePreviewExpanded, setIsMessagePreviewExpanded] = useState(false);
  const [waitEnabled, setWaitEnabled] = useState(data.waitEnabled || false);
  const [waitPeriod, setWaitPeriod] = useState(data.waitPeriod || '1 day');
  const [noResponseEnabled, setNoResponseEnabled] = useState(data.noResponseEnabled !== undefined ? data.noResponseEnabled : true);
  const [noResponseAction, setNoResponseAction] = useState(data.noResponseAction || 'send-follow-up');
  const [messageType, setMessageType] = useState(data.messageType || 'message');
  
  // Decision-maker filter states (exec/hiring manager default, others disabled)
  const [execHiringManagerEnabled, setExecHiringManagerEnabled] = useState(data.execHiringManagerEnabled !== undefined ? data.execHiringManagerEnabled : true);
  const [peerEnabled, setPeerEnabled] = useState(data.peerEnabled !== undefined ? data.peerEnabled : false);
  const [recruiterEnabled, setRecruiterEnabled] = useState(data.recruiterEnabled !== undefined ? data.recruiterEnabled : false);
  
  const { deleteElements, updateNodeData } = useReactFlow();

  // Determine if this action needs a message
  const needsMessage = () => {
    const messageRequiredTypes = ['send-message', 'connection-request'];
    return messageRequiredTypes.includes(data.originalType || '');
  };

  // Determine if this action expects a response
  const isResponseExpectedAction = () => {
    const responseExpectedTypes = ['send-message', 'connection-request'];
    return responseExpectedTypes.includes(data.originalType || '');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  const updateSettings = () => {
    updateNodeData(id, {
      ...data,
      waitEnabled,
      waitPeriod,
      noResponseEnabled,
      noResponseAction,
      messageType,
      execHiringManagerEnabled,
      peerEnabled,
      recruiterEnabled,
    });
  };

  React.useEffect(() => {
    updateSettings();
  }, [waitEnabled, waitPeriod, noResponseEnabled, noResponseAction, messageType, execHiringManagerEnabled, peerEnabled, recruiterEnabled]);

  // Get preview message for display
  const getPreviewMessage = () => {
    if (needsMessage()) {
      return messageGenerator.getPreviewMessage(data.originalType || '', messageType);
    }
    return '';
  };

  // Use dynamic colors or fallback to defaults
  const gradientColor = data.color || 'from-blue-400 to-cyan-500';
  const borderColor = data.color ? 
    `border-${data.color.split('-')[1]}-200` : 'border-blue-200';
  const bgColor = data.color ? 
    `from-${data.color.split('-')[1]}-50 to-${data.color.split('-')[2]?.split('-')[0] || 'cyan'}-50` : 
    'from-blue-50 to-cyan-50';
  const handleColor = data.color ? 
    `!bg-${data.color.split('-')[1]}-500` : '!bg-blue-500';

  const IconComponent = (data.icon && iconMap[data.icon as keyof typeof iconMap]) || iconMap.Send;
  
  // Use appropriate icon based on message type for send-message actions
  const getDisplayIcon = () => {
    if (data.originalType === 'send-message') {
      return messageType === 'inmail' ? Mail : MessageSquare;
    }
    return IconComponent;
  };
  
  const DisplayIcon = getDisplayIcon();

  return (
    <Card 
      className={`min-w-[280px] border-2 ${borderColor} bg-gradient-to-br ${bgColor} hover:shadow-lg transition-all duration-200 relative ${isExpanded ? 'shadow-xl' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <button
          onClick={handleDelete}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs z-10 shadow-lg transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      
      <Handle
        type="target"
        position={Position.Top}
        className={`w-3 h-3 ${handleColor} !border-2 !border-white shadow-lg`}
      />
      
      <div className="p-4">
        {/* Main Action */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${gradientColor} text-white`}>
            <DisplayIcon className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm text-foreground">
              {data.originalType === 'send-message' ? 
                `Send ${messageType === 'inmail' ? 'InMail' : 'Message'}` : 
                data.label
              }
            </div>
            {data.description && (
              <div className="text-xs text-muted-foreground">{data.description}</div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <Settings className="h-3 w-3" />}
          </Button>
        </div>

        {/* Expanded Settings */}
        {isExpanded && (
          <div className="space-y-4 pt-3 border-t border-border/50">
            {/* Auto-Generated Message Preview for message/connection actions */}
            {needsMessage() && (
              <div className="mb-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                <button
                  onClick={() => setIsMessagePreviewExpanded(!isMessagePreviewExpanded)}
                  className="flex items-center justify-between w-full mb-2 text-left hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">Message Preview</Label>
                    <div className="flex items-center gap-1 text-emerald-600">
                      <Sparkles className="h-3 w-3" />
                      <span className="text-xs">Auto-generated</span>
                    </div>
                  </div>
                  {isMessagePreviewExpanded ? (
                    <ChevronUp className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  )}
                </button>
                
                {isMessagePreviewExpanded && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground bg-background border rounded p-2">
                      {getPreviewMessage()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ✨ Based on your Write Module preferences and selected audience
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Message Type Toggle - Only for send-message actions */}
            {data.originalType === 'send-message' && (
              <div className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DisplayIcon className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Message Type</Label>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-sm z-[9999] relative">
                          <div className="space-y-3 text-xs">
                            <div className="space-y-1">
                              <div className="font-medium flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Message (1st connections):
                              </div>
                              <div className="text-muted-foreground">Send to people you're already connected with. Free and unlimited.</div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-medium flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                InMail (Any LinkedIn user):
                              </div>
                              <div className="text-muted-foreground">Message anyone on LinkedIn, even if not connected. Requires LinkedIn Premium credits.</div>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Switch
                    checked={messageType === 'inmail'}
                    onCheckedChange={(checked) => setMessageType(checked ? 'inmail' : 'message')}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {messageType === 'inmail' ? (
                    <>
                      <Globe className="h-3 w-3 text-blue-500" />
                      <span className="text-muted-foreground">InMail (Any LinkedIn user)</span>
                    </>
                  ) : (
                    <>
                      <Users className="h-3 w-3 text-green-500" />
                      <span className="text-muted-foreground">Message (1st connections)</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Decision-Maker Filter - For connection, message, and view profile actions */}
            {['connection-request', 'send-message', 'view-profile'].includes(data.originalType as string) && (
              <div className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                 <div className="flex items-center gap-2 mb-3">
                   <Users className="h-4 w-4 text-muted-foreground" />
                   <Label className="text-sm font-medium">Target Audience</Label>
                 </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="exec-hiring-manager"
                      checked={execHiringManagerEnabled}
                      onCheckedChange={(checked) => setExecHiringManagerEnabled(!!checked)}
                    />
                    <Label htmlFor="exec-hiring-manager" className="text-sm">
                      Exec/Hiring Manager
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="peer"
                      checked={peerEnabled}
                      onCheckedChange={(checked) => setPeerEnabled(!!checked)}
                    />
                    <Label htmlFor="peer" className="text-sm">
                      Peer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="recruiter"
                      checked={recruiterEnabled}
                      onCheckedChange={(checked) => setRecruiterEnabled(!!checked)}
                    />
                    <Label htmlFor="recruiter" className="text-sm">
                      Recruiter
                    </Label>
                  </div>
                </div>
              </div>
            )}
            
            {/* Wait Period Toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <Label className="text-sm font-medium">Wait Period</Label>
                </div>
                <Switch
                  checked={waitEnabled}
                  onCheckedChange={setWaitEnabled}
                />
              </div>
              {waitEnabled && (
                <Select value={waitPeriod} onValueChange={setWaitPeriod}>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 hour">1 hour</SelectItem>
                    <SelectItem value="4 hours">4 hours</SelectItem>
                    <SelectItem value="1 day">1 day</SelectItem>
                    <SelectItem value="2 days">2 days</SelectItem>
                    <SelectItem value="1 week">1 week</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Split if Replied Toggle - Only for response-expected actions */}
            {isResponseExpectedAction() && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-3 w-3 text-muted-foreground" />
                    <Label className="text-sm font-medium">Split if Replied</Label>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent className="z-[9999] relative">
                          <p className="text-xs">Customize what happens after your message is sent</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Switch
                    checked={noResponseEnabled}
                    onCheckedChange={setNoResponseEnabled}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Status Indicators */}
        {!isExpanded && (
          (() => {
            // Count enabled decision-maker types
            const enabledAudiences = [
              execHiringManagerEnabled,
              peerEnabled,
              recruiterEnabled
            ].filter(Boolean).length;
            
            const hasMultipleAudiences = enabledAudiences > 1;
            const showsAudienceTargeting = ['connection-request', 'send-message', 'view-profile'].includes(data.originalType as string);
            
            // Functional tags (non-audience)
            const functionalTags = (
              <>
                {needsMessage() && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs">
                    <Sparkles className="h-2 w-2" />
                    <span>Auto-message</span>
                  </div>
                )}
                {waitEnabled && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">
                    <Clock className="h-2 w-2" />
                    <span>{waitPeriod}</span>
                  </div>
                )}
                {noResponseEnabled && isResponseExpectedAction() && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    <GitBranch className="h-2 w-2" />
                    <span>Split if replied</span>
                  </div>
                )}
              </>
            );

            // Audience badges
            const audienceBadges = (
              <>
                {execHiringManagerEnabled && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    <span>Exec</span>
                  </div>
                )}
                {peerEnabled && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                    <span>Peer</span>
                  </div>
                )}
                {recruiterEnabled && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                    <span>Recruiter</span>
                  </div>
                )}
              </>
            );

            if (hasMultipleAudiences && showsAudienceTargeting) {
              // Multi-row layout: audiences on first row, functional tags on second row
              return (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1 flex-wrap">
                    {audienceBadges}
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {functionalTags}
                  </div>
                </div>
              );
            } else {
              // Single row layout: all tags together
              return (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {showsAudienceTargeting && audienceBadges}
                  {functionalTags}
                </div>
              );
            }
          })()
        )}
      </div>
      
      {/* Dynamic Source Handles based on Split Logic */}
      {noResponseEnabled && isResponseExpectedAction() ? (
        <>
          {/* Reply Handle (Left) */}
          <Handle
            type="source"
            position={Position.Bottom}
            id="reply"
            className="w-3 h-3 !bg-green-500 !border-2 !border-white shadow-lg !left-[25%]"
          />
          {/* No Reply Handle (Right) */}
          <Handle
            type="source"
            position={Position.Bottom}
            id="no-reply"
            className="w-3 h-3 !bg-red-500 !border-2 !border-white shadow-lg !left-[75%]"
          />
          {/* Handle Labels */}
          <div className="absolute -bottom-6 left-0 w-full flex justify-between px-4 text-xs text-muted-foreground">
            <span className="text-green-600 font-medium">Reply</span>
            <span className="text-red-600 font-medium">No Reply</span>
          </div>
        </>
      ) : (
        // Single handle when split is disabled
        <Handle
          type="source"
          position={Position.Bottom}
          className={`w-3 h-3 ${handleColor} !border-2 !border-white shadow-lg`}
        />
      )}
    </Card>
  );
};

export default EnhancedActionNode;