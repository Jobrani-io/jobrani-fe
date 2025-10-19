export interface ProspectJob {
  id: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  companySize: string;
  location: string;
  recentNews?: string;
  mutualConnections: number;
  linkedinUrl: string;
  companyLogo?: string;
  jobContext: {
    isHiring: boolean;
    recentFunding?: string;
    techStack?: string[];
    challenges?: string[];
  };
}

export interface ProspectMessage {
  step: number;
  type: 'connection' | 'follow-up' | 'inmail';
  subject?: string;
  content: string;
  personalizedContent: string;
  delay: string;
}

export interface ProspectApproval {
  prospectId: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  reviewedAt?: string;
}

export const SAMPLE_PROSPECTS: ProspectJob[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    title: 'VP of Marketing',
    company: 'Noom',
    industry: 'Health Tech',
    companySize: '1000-5000',
    location: 'New York, NY',
    recentNews: 'Noom raises $540M Series F, expands mental health offerings',
    mutualConnections: 3,
    linkedinUrl: 'linkedin.com/in/sarahchen',
    jobContext: {
      isHiring: true,
      recentFunding: '$540M Series F',
      techStack: ['React', 'Python', 'AWS'],
      challenges: ['User retention', 'B2B expansion', 'International growth']
    }
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    title: 'Head of Growth',
    company: 'Stripe',
    industry: 'FinTech',
    companySize: '5000+',
    location: 'San Francisco, CA',
    recentNews: 'Stripe launches new payment platform for emerging markets',
    mutualConnections: 7,
    linkedinUrl: 'linkedin.com/in/marcusrodriguez',
    jobContext: {
      isHiring: true,
      techStack: ['Ruby', 'Go', 'Kubernetes'],
      challenges: ['Global expansion', 'Regulatory compliance', 'Developer adoption']
    }
  },
  {
    id: '3',
    name: 'Jennifer Park',
    title: 'Director of Product Marketing',
    company: 'Canva',
    industry: 'Design Tech',
    companySize: '1000-5000',
    location: 'Sydney, Australia',
    recentNews: 'Canva reaches 135M monthly active users globally',
    mutualConnections: 2,
    linkedinUrl: 'linkedin.com/in/jenniferpark',
    jobContext: {
      isHiring: false,
      techStack: ['TypeScript', 'React', 'Node.js'],
      challenges: ['Enterprise adoption', 'Feature discovery', 'User onboarding']
    }
  },
  {
    id: '4',
    name: 'David Kim',
    title: 'VP of Sales',
    company: 'Notion',
    industry: 'Productivity',
    companySize: '500-1000',
    location: 'San Francisco, CA',
    recentNews: 'Notion AI launches with 10M+ users in first month',
    mutualConnections: 5,
    linkedinUrl: 'linkedin.com/in/davidkim',
    jobContext: {
      isHiring: true,
      recentFunding: '$275M Series C',
      techStack: ['React', 'Node.js', 'PostgreSQL'],
      challenges: ['Enterprise sales', 'Team collaboration', 'AI integration']
    }
  },
  {
    id: '5',
    name: 'Amanda Foster',
    title: 'Chief Marketing Officer',
    company: 'Figma',
    industry: 'Design Tech',
    companySize: '1000-5000',
    location: 'San Francisco, CA',
    recentNews: 'Figma Config 2024 announces new developer tools',
    mutualConnections: 4,
    linkedinUrl: 'linkedin.com/in/amandafoster',
    jobContext: {
      isHiring: true,
      techStack: ['TypeScript', 'WebGL', 'Rust'],
      challenges: ['Developer adoption', 'Design systems', 'Collaboration tools']
    }
  },
  {
    id: '6',
    name: 'Robert Chen',
    title: 'Head of Marketing',
    company: 'Linear',
    industry: 'Productivity',
    companySize: '100-500',
    location: 'Remote',
    recentNews: 'Linear Series B raises $52M, reaches 25k+ teams',
    mutualConnections: 1,
    linkedinUrl: 'linkedin.com/in/robertchen',
    jobContext: {
      isHiring: true,
      recentFunding: '$52M Series B',
      techStack: ['React', 'Node.js', 'GraphQL'],
      challenges: ['Product adoption', 'Team workflows', 'Integration ecosystem']
    }
  }
];

export const PROSPECT_MESSAGE_SEQUENCES: Record<string, ProspectMessage[]> = {
  '1': [ // Sarah Chen - Noom
    {
      step: 1,
      type: 'connection',
      content: "Hi {{firstName}}, I noticed your work scaling marketing at {{company}}. With {{company}}'s recent expansion into mental health, I'd love to connect and share some insights on user engagement strategies that have helped similar health tech companies increase retention by 40%+.",
      personalizedContent: "Hi Sarah, I noticed your work scaling marketing at Noom. With Noom's recent expansion into mental health, I'd love to connect and share some insights on user engagement strategies that have helped similar health tech companies increase retention by 40%+.",
      delay: 'Immediate'
    },
    {
      step: 2,
      type: 'follow-up',
      content: "Hi {{firstName}}, I saw {{company}} just raised {{recentFunding}} - congratulations! I've been helping health tech VPs like yourself tackle the user retention challenge that comes with rapid growth. Would you be open to a 15-minute chat about how we've helped companies like Headspace increase their 90-day retention by 35%?",
      personalizedContent: "Hi Sarah, I saw Noom just raised $540M Series F - congratulations! I've been helping health tech VPs like yourself tackle the user retention challenge that comes with rapid growth. Would you be open to a 15-minute chat about how we've helped companies like Headspace increase their 90-day retention by 35%?",
      delay: '3 days'
    },
    {
      step: 3,
      type: 'follow-up',
      content: "{{firstName}}, I know scaling marketing at {{company}} keeps you busy. Just wanted to share a quick case study of how we helped a health tech company similar to {{company}} boost their user engagement by 45% in 6 months. Worth a quick look? Happy to send it over with no strings attached.",
      personalizedContent: "Sarah, I know scaling marketing at Noom keeps you busy. Just wanted to share a quick case study of how we helped a health tech company similar to Noom boost their user engagement by 45% in 6 months. Worth a quick look? Happy to send it over with no strings attached.",
      delay: '1 week'
    }
  ],
  '2': [ // Marcus Rodriguez - Stripe
    {
      step: 1,
      type: 'connection',
      content: "Hi {{firstName}}, I've been following {{company}}'s expansion into emerging markets - impressive growth strategy! I work with growth leaders at fintech companies and would love to connect. I have some insights on developer adoption strategies that might be relevant to {{company}}'s platform expansion.",
      personalizedContent: "Hi Marcus, I've been following Stripe's expansion into emerging markets - impressive growth strategy! I work with growth leaders at fintech companies and would love to connect. I have some insights on developer adoption strategies that might be relevant to Stripe's platform expansion.",
      delay: 'Immediate'
    },
    {
      step: 2,
      type: 'follow-up',
      content: "{{firstName}}, congrats on {{company}}'s new payment platform launch! I've been helping growth teams at companies like Plaid and Twilio tackle similar developer adoption challenges. Would you be interested in a brief chat about strategies that have increased developer engagement by 60%+ in competitive markets?",
      personalizedContent: "Marcus, congrats on Stripe's new payment platform launch! I've been helping growth teams at companies like Plaid and Twilio tackle similar developer adoption challenges. Would you be interested in a brief chat about strategies that have increased developer engagement by 60%+ in competitive markets?",
      delay: '4 days'
    }
  ],
  '3': [ // Jennifer Park - Canva
    {
      step: 1,
      type: 'inmail',
      subject: 'Congrats on Canva reaching 135M users!',
      content: "Hi {{firstName}}, Incredible milestone with {{company}} hitting {{userCount}}! I've been working with product marketing directors at design tools companies and noticed how challenging feature discovery becomes at scale. I'd love to share some strategies that have helped similar companies improve feature adoption by 50%+. Worth a quick chat?",
      personalizedContent: "Hi Jennifer, Incredible milestone with Canva hitting 135M monthly users! I've been working with product marketing directors at design tools companies and noticed how challenging feature discovery becomes at scale. I'd love to share some strategies that have helped similar companies improve feature adoption by 50%+. Worth a quick chat?",
      delay: 'Immediate'
    },
    {
      step: 2,
      type: 'follow-up',
      content: "{{firstName}}, I know you're focused on enterprise adoption at {{company}}. Just came across a case study of how we helped Miro increase their enterprise feature discovery by 40% without overwhelming existing users. Happy to share the strategy if it would be helpful for {{company}}'s roadmap.",
      personalizedContent: "Jennifer, I know you're focused on enterprise adoption at Canva. Just came across a case study of how we helped Miro increase their enterprise feature discovery by 40% without overwhelming existing users. Happy to share the strategy if it would be helpful for Canva's roadmap.",
      delay: '5 days'
    }
  ],
  '4': [ // David Kim - Notion
    {
      step: 1,
      type: 'connection',
      content: "Hi {{firstName}}, Amazing launch with {{company}} AI! 10M+ users in the first month is incredible. I work with sales leaders at productivity companies navigating the shift to AI-powered features. Would love to connect and share insights on enterprise sales strategies for AI products.",
      personalizedContent: "Hi David, Amazing launch with Notion AI! 10M+ users in the first month is incredible. I work with sales leaders at productivity companies navigating the shift to AI-powered features. Would love to connect and share insights on enterprise sales strategies for AI products.",
      delay: 'Immediate'
    },
    {
      step: 2,
      type: 'follow-up',
      content: "{{firstName}}, I've been helping VPs at companies like Slack and Airtable navigate enterprise sales for AI-integrated products. The adoption patterns are fascinating. Would you be open to a 20-minute discussion about what we're seeing work best for driving enterprise deals in the AI productivity space?",
      personalizedContent: "David, I've been helping VPs at companies like Slack and Airtable navigate enterprise sales for AI-integrated products. The adoption patterns are fascinating. Would you be open to a 20-minute discussion about what we're seeing work best for driving enterprise deals in the AI productivity space?",
      delay: '3 days'
    }
  ],
  '5': [ // Amanda Foster - Figma
    {
      step: 1,
      type: 'connection',
      content: "Hi {{firstName}}, Loved the developer tools announcement at {{company}} Config 2024! I work with marketing leaders at design tech companies and have insights on driving developer adoption for design tools. Would love to connect and share what's working in this space.",
      personalizedContent: "Hi Amanda, Loved the developer tools announcement at Figma Config 2024! I work with marketing leaders at design tech companies and have insights on driving developer adoption for design tools. Would love to connect and share what's working in this space.",
      delay: 'Immediate'
    }
  ],
  '6': [ // Robert Chen - Linear
    {
      step: 1,
      type: 'connection',
      content: "Hi {{firstName}}, Congrats on {{company}}'s Series B! Reaching 25k+ teams is impressive. I work with marketing leaders at productivity companies and have insights on scaling adoption during rapid growth phases. Would love to connect and share strategies that have worked for similar stage companies.",
      personalizedContent: "Hi Robert, Congrats on Linear's Series B! Reaching 25k+ teams is impressive. I work with marketing leaders at productivity companies and have insights on scaling adoption during rapid growth phases. Would love to connect and share strategies that have worked for similar stage companies.",
      delay: 'Immediate'
    },
    {
      step: 2,
      type: 'follow-up',
      content: "{{firstName}}, I know scaling marketing at {{company}} during this growth phase is intense. Just wanted to share a playbook we created for productivity companies post-Series B that covers team workflow optimization and integration ecosystem growth. Worth a quick look?",
      personalizedContent: "Robert, I know scaling marketing at Linear during this growth phase is intense. Just wanted to share a playbook we created for productivity companies post-Series B that covers team workflow optimization and integration ecosystem growth. Worth a quick look?",
      delay: '4 days'
    }
  ]
};

export const getProspectMessages = (prospectId: string): ProspectMessage[] => {
  return PROSPECT_MESSAGE_SEQUENCES[prospectId] || [];
};

export const getProspectById = (prospectId: string): ProspectJob | undefined => {
  return SAMPLE_PROSPECTS.find(prospect => prospect.id === prospectId);
};

export const getApprovalStats = (approvals: Record<string, ProspectApproval>) => {
  const total = SAMPLE_PROSPECTS.length;
  const approved = Object.values(approvals).filter(a => a.status === 'approved').length;
  const rejected = Object.values(approvals).filter(a => a.status === 'rejected').length;
  const pending = total - approved - rejected;
  
  return { total, approved, rejected, pending };
};