export interface SampleMessage {
  id: string;
  title: string;
  content: string;
  type: 'connection' | 'message' | 'inmail';
  step: number;
  stepName: string;
  characterCount: number;
  hasTokens: boolean;
  tokens: string[];
  validationIssues: string[];
  complianceStatus: 'good' | 'warning' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

export const SAMPLE_MESSAGES: SampleMessage[] = [
  {
    id: 'msg-1',
    title: 'Professional Connection Request',
    content: 'Hi {{firstName}}, I noticed your background in {{industry}} and would love to connect. I\'m passionate about {{skillArea}} and think we could have some great insights to share.',
    type: 'connection',
    step: 1,
    stepName: 'Initial Connection',
    characterCount: 156,
    hasTokens: true,
    tokens: ['{{firstName}}', '{{industry}}', '{{skillArea}}'],
    validationIssues: [],
    complianceStatus: 'good',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'msg-2',
    title: 'Industry Research Follow-up',
    content: 'Thanks for connecting, {{firstName}}! I saw {{companyName}}\'s recent announcement about {{recentNews}}. As someone working in {{myRole}}, I\'d love to hear your perspective on how this might impact the {{industry}} landscape.',
    type: 'message',
    step: 2,
    stepName: 'Research Follow-up',
    characterCount: 243,
    hasTokens: true,
    tokens: ['{{firstName}}', '{{companyName}}', '{{recentNews}}', '{{myRole}}', '{{industry}}'],
    validationIssues: [],
    complianceStatus: 'good',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16')
  },
  {
    id: 'msg-3',
    title: 'Value Proposition Message',
    content: 'Hi {{firstName}}, I help {{jobTitle}}s at companies like {{companyName}} achieve {{specificOutcome}}. Based on your LinkedIn activity, it seems like {{relevantChallenge}} might be relevant to your team. Would you be open to a brief conversation?',
    type: 'message',
    step: 3,
    stepName: 'Value Proposition',
    characterCount: 251,
    hasTokens: true,
    tokens: ['{{firstName}}', '{{jobTitle}}', '{{companyName}}', '{{specificOutcome}}', '{{relevantChallenge}}'],
    validationIssues: [],
    complianceStatus: 'good',
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17')
  },
  {
    id: 'msg-4',
    title: 'InMail with Research Hook',
    content: 'Hi {{firstName}}, I came across your recent post about {{recentPost}} and found your insights on {{topicMention}} particularly compelling. I work with {{targetRole}}s helping them {{valueProposition}}. Given {{companyName}}\'s focus on {{companyFocus}}, I thought you might find our approach interesting. Would you be open to a 15-minute conversation to explore potential synergies?',
    type: 'inmail',
    step: 1,
    stepName: 'InMail Outreach',
    characterCount: 387,
    hasTokens: true,
    tokens: ['{{firstName}}', '{{recentPost}}', '{{topicMention}}', '{{targetRole}}', '{{valueProposition}}', '{{companyName}}', '{{companyFocus}}'],
    validationIssues: ['Message exceeds recommended 300 character limit for InMail'],
    complianceStatus: 'warning',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: 'msg-5',
    title: 'Event-Based Follow-up',
    content: 'Hi {{firstName}}, Great meeting you at {{eventName}}! Our conversation about {{conversationTopic}} really stuck with me. I\'d love to continue our discussion and share some insights that might be relevant to {{companyName}}\'s {{businessGoal}}.',
    type: 'message',
    step: 2,
    stepName: 'Event Follow-up',
    characterCount: 234,
    hasTokens: true,
    tokens: ['{{firstName}}', '{{eventName}}', '{{conversationTopic}}', '{{companyName}}', '{{businessGoal}}'],
    validationIssues: [],
    complianceStatus: 'good',
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19')
  },
  {
    id: 'msg-6',
    title: 'Mutual Connection Referral',
    content: 'Hi {{firstName}}, {{mutualConnection}} suggested I reach out to you. They mentioned you\'re working on {{currentProject}} at {{companyName}}. I have experience helping companies with similar initiatives and would love to share some insights that might be valuable.',
    type: 'connection',
    step: 1,
    stepName: 'Referral Connection',
    characterCount: 267,
    hasTokens: true,
    tokens: ['{{firstName}}', '{{mutualConnection}}', '{{currentProject}}', '{{companyName}}'],
    validationIssues: [],
    complianceStatus: 'good',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'msg-7',
    title: 'Content Engagement Message',
    content: 'Hey {{firstName}}, I saw your comment on {{linkedinPost}} about {{commentTopic}}. Your perspective on {{specificPoint}} was spot-on! I work with {{industry}} leaders on similar challenges. Would love to connect and exchange insights.',
    type: 'message',
    step: 3,
    stepName: 'Content Engagement',
    characterCount: 241,
    hasTokens: true,
    tokens: ['{{firstName}}', '{{linkedinPost}}', '{{commentTopic}}', '{{specificPoint}}', '{{industry}}'],
    validationIssues: [],
    complianceStatus: 'good',
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21')
  },
  {
    id: 'msg-8',
    title: 'Problematic Generic Message',
    content: 'Hi there! I have an amazing opportunity that could change your life! This is the best deal you\'ll ever see and you need to act fast! Click here now to learn more about this incredible business opportunity! Don\'t miss out!',
    type: 'message',
    step: 4,
    stepName: 'Generic Outreach',
    characterCount: 234,
    hasTokens: false,
    tokens: [],
    validationIssues: [
      'No personalization tokens found',
      'Contains spam-like language ("amazing opportunity", "act fast")',
      'Missing recipient name',
      'Overly promotional tone',
      'Contains potential spam triggers'
    ],
    complianceStatus: 'error',
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: 'msg-9',
    title: 'Company Growth Follow-up',
    content: 'Hi {{firstName}}, Congratulations on {{companyName}}\'s recent {{recentAchievement}}! I noticed you\'re expanding your {{department}} team. I help companies at this growth stage optimize their {{processArea}}. Would you be interested in a brief chat about your scaling challenges?',
    type: 'message',
    step: 3,
    stepName: 'Growth Follow-up',
    characterCount: 289,
    hasTokens: true,
    tokens: ['{{firstName}}', '{{companyName}}', '{{recentAchievement}}', '{{department}}', '{{processArea}}'],
    validationIssues: [],
    complianceStatus: 'good',
    createdAt: new Date('2024-01-23'),
    updatedAt: new Date('2024-01-23')
  },
  {
    id: 'msg-10',
    title: 'Educational Resource Share',
    content: 'Hi {{firstName}}, I came across a {{resourceType}} about {{topicArea}} that immediately made me think of our conversation about {{sharedInterest}}. I think you\'d find the section on {{specificSection}} particularly relevant to {{companyName}}\'s {{currentChallenge}}. Happy to share if you\'re interested!',
    type: 'message',
    step: 4,
    stepName: 'Resource Share',
    characterCount: 312,
    hasTokens: true,
    tokens: ['{{firstName}}', '{{resourceType}}', '{{topicArea}}', '{{sharedInterest}}', '{{specificSection}}', '{{companyName}}', '{{currentChallenge}}'],
    validationIssues: ['Message exceeds recommended 300 character limit'],
    complianceStatus: 'warning',
    createdAt: new Date('2024-01-24'),
    updatedAt: new Date('2024-01-24')
  }
];

export const getMessagesByApprovalStatus = (messages: SampleMessage[], approvals: Record<string, 'pending' | 'approved' | 'rejected'>) => {
  const approved = messages.filter(msg => approvals[msg.id] === 'approved');
  const pending = messages.filter(msg => approvals[msg.id] === 'pending');
  const rejected = messages.filter(msg => approvals[msg.id] === 'rejected');
  
  return { approved, pending, rejected };
};

export const getValidationSummary = (messages: SampleMessage[]) => {
  const totalIssues = messages.reduce((sum, msg) => sum + msg.validationIssues.length, 0);
  const errorMessages = messages.filter(msg => msg.complianceStatus === 'error').length;
  const warningMessages = messages.filter(msg => msg.complianceStatus === 'warning').length;
  const goodMessages = messages.filter(msg => msg.complianceStatus === 'good').length;
  
  return {
    totalIssues,
    errorMessages,
    warningMessages,
    goodMessages
  };
};