import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Brain, Building2, User } from 'lucide-react';

interface MockProspect {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
  industry: string;
  contactType: 'decision-maker' | 'recruiter' | 'peer';
  jobOpening: string;
}

const companyScenarios = [
  {
    company: 'Karbon',
    industry: 'SaaS',
    jobOpening: 'VP Product',
    prospects: [
      { id: '1', firstName: 'Mary', lastName: 'Delaney', jobTitle: 'CEO', contactType: 'decision-maker' },
      { id: '2', firstName: 'Ayanna', lastName: 'Williams', jobTitle: 'Recruiter', contactType: 'recruiter' },
      { id: '3', firstName: 'Lachlan', lastName: 'Macindoe', jobTitle: 'VP of Marketing', contactType: 'peer' }
    ]
  },
  {
    company: 'Stripe',
    industry: 'Fintech',
    jobOpening: 'Head of Growth',
    prospects: [
      { id: '4', firstName: 'Patrick', lastName: 'Collison', jobTitle: 'CEO', contactType: 'decision-maker' },
      { id: '5', firstName: 'Sarah', lastName: 'Kim', jobTitle: 'Talent Partner', contactType: 'recruiter' },
      { id: '6', firstName: 'David', lastName: 'Chen', jobTitle: 'VP of Growth', contactType: 'peer' }
    ]
  },
  {
    company: 'Notion',
    industry: 'Productivity',
    jobOpening: 'Senior Designer',
    prospects: [
      { id: '7', firstName: 'Ivan', lastName: 'Zhao', jobTitle: 'CEO', contactType: 'decision-maker' },
      { id: '8', firstName: 'Jessica', lastName: 'Park', jobTitle: 'Recruiting Lead', contactType: 'recruiter' },
      { id: '9', firstName: 'Alex', lastName: 'Turner', jobTitle: 'Design Lead', contactType: 'peer' }
    ]
  },
  {
    company: 'Airbnb',
    industry: 'Travel',
    jobOpening: 'Product Manager',
    prospects: [
      { id: '10', firstName: 'Brian', lastName: 'Chesky', jobTitle: 'CEO', contactType: 'decision-maker' },
      { id: '11', firstName: 'Maya', lastName: 'Rodriguez', jobTitle: 'Head of Talent', contactType: 'recruiter' },
      { id: '12', firstName: 'Jordan', lastName: 'Lee', jobTitle: 'Senior PM', contactType: 'peer' }
    ]
  }
];

const allProspects: MockProspect[] = companyScenarios.flatMap(scenario => 
  scenario.prospects.map(prospect => ({
    ...prospect,
    company: scenario.company,
    industry: scenario.industry,
    jobOpening: scenario.jobOpening,
    contactType: prospect.contactType as 'decision-maker' | 'recruiter' | 'peer'
  }))
);

const LiveMessagePreview = () => {
  const [currentProspectIndex, setCurrentProspectIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);

  const currentProspect = allProspects[currentProspectIndex];

  const generateMessage = useCallback((prospect: MockProspect) => {
    const companyMessages = {
      'Karbon': {
        'recruiter': `Hi ${prospect.firstName} — Saw you're hiring a VP Product at Karbon. I bring 10+ yrs in UI/UX (Meta, Shopify), scaling complex products with strong customer focus and revenue impact. I'd love to connect and explore if there's a fit.`,
        'peer': `Hi ${prospect.firstName} — Noticed you're scaling at Karbon and hiring a VP Product. I've led product at Meta & Shopify with a focus on UX that drives monetization—especially during 3X growth phases. Would be great to connect.`,
        'decision-maker': `Hi ${prospect.firstName} — Saw you're hiring a VP Product at Karbon. I've led UX-driven growth at Meta & Shopify, scaling complex products through 3X+ revenue phases. I'd love to connect and share ideas.`
      },
      'Stripe': {
        'recruiter': `Hi ${prospect.firstName} — Noticed you're hiring for Head of Growth at Stripe. My background includes scaling growth at fintech startups (2 exits) with expertise in payment optimization and user acquisition.`,
        'peer': `Hi ${prospect.firstName} — Saw you're expanding the growth team at Stripe. I've driven growth at fintech companies with focus on payment conversion optimization and international expansion.`,
        'decision-maker': `Hi ${prospect.firstName} — Impressive work with Stripe's growth trajectory. I've led growth initiatives at fintech companies through hypergrowth phases, focusing on payment optimization and market expansion.`
      },
      'Notion': {
        'recruiter': `Hi ${prospect.firstName} — Saw the Senior Designer opening at Notion. I specialize in productivity tool design with 8+ years creating intuitive interfaces for complex workflows.`,
        'peer': `Hi ${prospect.firstName} — Love what you're building at Notion! I'm a designer focused on productivity tools and collaborative interfaces. Would be great to connect and discuss design challenges.`,
        'decision-maker': `Hi ${prospect.firstName} — Notion's design vision is inspiring. I've led design for productivity platforms with focus on user workflows and collaborative experiences.`
      },
      'Airbnb': {
        'recruiter': `Hi ${prospect.firstName} — Noticed you're hiring a Product Manager at Airbnb. I have 7+ years in marketplace product management with expertise in trust & safety, international expansion.`,
        'peer': `Hi ${prospect.firstName} — Following Airbnb's product evolution closely. I'm a PM specializing in marketplace dynamics and international product strategy.`,
        'decision-maker': `Hi ${prospect.firstName} — Admire Airbnb's product innovation in the travel space. I've led product for marketplace platforms with focus on trust systems and international expansion.`
      }
    };
    
    return companyMessages[prospect.company as keyof typeof companyMessages]?.[prospect.contactType] || 
           `Hi ${prospect.firstName} — Great to connect!`;
  }, []);

  // Auto-cycling with typing effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsGenerating(true);
      setDisplayText('');
      setTypingIndex(0);
      
      setTimeout(() => {
        setCurrentProspectIndex(prev => (prev + 1) % allProspects.length);
        setIsGenerating(false);
      }, 1000);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Typing effect
  useEffect(() => {
    if (!isGenerating && currentProspect) {
      const fullMessage = generateMessage(currentProspect);
      
      if (typingIndex < fullMessage.length) {
        const timeout = setTimeout(() => {
          setDisplayText(fullMessage.substring(0, typingIndex + 1));
          setTypingIndex(prev => prev + 1);
        }, 30);
        
        return () => clearTimeout(timeout);
      }
    }
  }, [isGenerating, currentProspect, typingIndex, generateMessage]);

  // Reset typing when prospect changes
  useEffect(() => {
    if (!isGenerating) {
      setTypingIndex(0);
      setDisplayText('');
    }
  }, [currentProspectIndex, isGenerating]);

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'decision-maker': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'recruiter': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'peer': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  if (!currentProspect) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold">AI Message Generator</h4>
        <div className="flex items-center gap-2">
          {isGenerating && (
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Prospect Info Card */}
      <div className="bg-background/60 rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold">{currentProspect.firstName} {currentProspect.lastName}</div>
              <div className="text-sm text-muted-foreground">{currentProspect.jobTitle}</div>
            </div>
          </div>
          <Badge className={`text-xs ${getContactTypeColor(currentProspect.contactType)}`}>
            {currentProspect.contactType.replace('-', ' ')}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Building2 className="w-4 h-4" />
            <span>{currentProspect.company}</span>
          </div>
          <div>•</div>
          <div>{currentProspect.industry}</div>
          <div>•</div>
          <div className="text-primary font-medium">{currentProspect.jobOpening}</div>
        </div>
      </div>
      
      {/* Generated Message */}
      <div className="bg-background/60 rounded-lg p-4 border">
        <div className="flex items-center space-x-2 mb-3">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">LinkedIn Connection Request</span>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="text-xs text-blue-600 dark:text-blue-400 mb-2 font-medium">Personalized Message</div>
          <div className="text-sm text-foreground/90 leading-relaxed min-h-[60px]">
            {isGenerating ? (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <div className="animate-pulse">Generating personalized message for {currentProspect.firstName}...</div>
              </div>
            ) : (
              <div>
                {displayText}
                {typingIndex < generateMessage(currentProspect).length && (
                  <span className="animate-pulse">|</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMessagePreview;