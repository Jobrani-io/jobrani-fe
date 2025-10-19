export interface JobOpportunity {
  id: string;
  company: string;
  jobTitle: string;
  industry: string;
  location: string;
  companySize: string;
  isHiring: boolean;
  recentNews?: string;
  potentialContacts: JobContact[];
  matchStatus: 'matched' | 'multiple-matches' | 'no-match';
  selectedContactId?: string;
  isCompleted: boolean;
}

export interface JobContact {
  id: string;
  name: string;
  title: string;
  mutualConnections: number;
  linkedinUrl: string;
  matchScore: number; // 0-100 score based on title matching
}

export interface ContactFilter {
  titlesToInclude: string[];
  titlesToExclude: string[];
  exactMatch: boolean;
}

// Sample job opportunities data
export const SAMPLE_JOB_OPPORTUNITIES: JobOpportunity[] = [
  {
    id: 'job-1',
    company: 'Stripe',
    jobTitle: 'Product Manager',
    industry: 'FinTech',
    location: 'San Francisco, CA',
    companySize: '5000+',
    isHiring: true,
    recentNews: 'Stripe launches new payment platform for emerging markets',
    potentialContacts: [
      {
        id: 'contact-1-1',
        name: 'Marcus Rodriguez',
        title: 'Head of Growth',
        mutualConnections: 7,
        linkedinUrl: 'linkedin.com/in/marcusrodriguez',
        matchScore: 85
      },
      {
        id: 'contact-1-2',
        name: 'Sarah Kim',
        title: 'Director of Product',
        mutualConnections: 4,
        linkedinUrl: 'linkedin.com/in/sarahkim',
        matchScore: 92
      },
      {
        id: 'contact-1-3',
        name: 'Alex Chen',
        title: 'VP of Product',
        mutualConnections: 2,
        linkedinUrl: 'linkedin.com/in/alexchen',
        matchScore: 95
      }
    ],
    matchStatus: 'multiple-matches',
    isCompleted: false
  },
  {
    id: 'job-2',
    company: 'Figma',
    jobTitle: 'Senior Designer',
    industry: 'Design Tech',
    location: 'San Francisco, CA',
    companySize: '1000-5000',
    isHiring: true,
    recentNews: 'Figma Config 2024 announces new developer tools',
    potentialContacts: [
      {
        id: 'contact-2-1',
        name: 'Amanda Foster',
        title: 'Chief Marketing Officer',
        mutualConnections: 4,
        linkedinUrl: 'linkedin.com/in/amandafoster',
        matchScore: 88
      }
    ],
    matchStatus: 'matched',
    selectedContactId: 'contact-2-1',
    isCompleted: false
  },
  {
    id: 'job-3',
    company: 'Notion',
    jobTitle: 'Growth Marketing Manager',
    industry: 'Productivity',
    location: 'San Francisco, CA',
    companySize: '500-1000',
    isHiring: true,
    recentNews: 'Notion AI launches with 10M+ users in first month',
    potentialContacts: [
      {
        id: 'contact-3-1',
        name: 'David Kim',
        title: 'VP of Sales',
        mutualConnections: 5,
        linkedinUrl: 'linkedin.com/in/davidkim',
        matchScore: 72
      }
    ],
    matchStatus: 'matched',
    selectedContactId: 'contact-3-1',
    isCompleted: true
  },
  {
    id: 'job-4',
    company: 'Linear',
    jobTitle: 'Frontend Engineer',
    industry: 'Productivity',
    location: 'Remote',
    companySize: '100-500',
    isHiring: true,
    recentNews: 'Linear Series B raises $52M, reaches 25k+ teams',
    potentialContacts: [],
    matchStatus: 'no-match',
    isCompleted: false
  },
  {
    id: 'job-5',
    company: 'Canva',
    jobTitle: 'Marketing Director',
    industry: 'Design Tech',
    location: 'Sydney, Australia',
    companySize: '1000-5000',
    isHiring: false,
    recentNews: 'Canva reaches 135M monthly active users globally',
    potentialContacts: [
      {
        id: 'contact-5-1',
        name: 'Jennifer Park',
        title: 'Director of Product Marketing',
        mutualConnections: 2,
        linkedinUrl: 'linkedin.com/in/jenniferpark',
        matchScore: 90
      },
      {
        id: 'contact-5-2',
        name: 'Mike Wilson',
        title: 'Head of Marketing',
        mutualConnections: 1,
        linkedinUrl: 'linkedin.com/in/mikewilson',
        matchScore: 85
      }
    ],
    matchStatus: 'multiple-matches',
    isCompleted: false
  },
  {
    id: 'job-6',
    company: 'Noom',
    jobTitle: 'Product Marketing Manager',
    industry: 'Health Tech',
    location: 'New York, NY',
    companySize: '1000-5000',
    isHiring: true,
    recentNews: 'Noom raises $540M Series F, expands mental health offerings',
    potentialContacts: [
      {
        id: 'contact-6-1',
        name: 'Sarah Chen',
        title: 'VP of Marketing',
        mutualConnections: 3,
        linkedinUrl: 'linkedin.com/in/sarahchen',
        matchScore: 94
      }
    ],
    matchStatus: 'matched',
    selectedContactId: 'contact-6-1',
    isCompleted: false
  },
  {
    id: 'job-7',
    company: 'Vercel',
    jobTitle: 'Developer Relations',
    industry: 'Developer Tools',
    location: 'Remote',
    companySize: '100-500',
    isHiring: true,
    recentNews: 'Vercel announces new Edge Runtime for global performance',
    potentialContacts: [
      {
        id: 'contact-7-1',
        name: 'Jake Morrison',
        title: 'Head of Developer Experience',
        mutualConnections: 6,
        linkedinUrl: 'linkedin.com/in/jakemorrison',
        matchScore: 91
      }
    ],
    matchStatus: 'matched',
    selectedContactId: 'contact-7-1',
    isCompleted: false
  },
  {
    id: 'job-8',
    company: 'Spotify',
    jobTitle: 'Product Designer',
    industry: 'Music Tech',
    location: 'Stockholm, Sweden',
    companySize: '5000+',
    isHiring: true,
    recentNews: 'Spotify hits 500M users, launches AI DJ feature',
    potentialContacts: [
      {
        id: 'contact-8-1',
        name: 'Emma Rodriguez',
        title: 'Design Manager',
        mutualConnections: 8,
        linkedinUrl: 'linkedin.com/in/emmarodriguez',
        matchScore: 89
      }
    ],
    matchStatus: 'matched',
    selectedContactId: 'contact-8-1',
    isCompleted: false
  },
  {
    id: 'job-9',
    company: 'Airtable',
    jobTitle: 'Solutions Engineer',
    industry: 'Productivity',
    location: 'San Francisco, CA',
    companySize: '1000-5000',
    isHiring: true,
    recentNews: 'Airtable partners with Slack for enhanced workflow automation',
    potentialContacts: [
      {
        id: 'contact-9-1',
        name: 'Ryan Foster',
        title: 'VP of Customer Success',
        mutualConnections: 5,
        linkedinUrl: 'linkedin.com/in/ryanfoster',
        matchScore: 86
      }
    ],
    matchStatus: 'matched',
    selectedContactId: 'contact-9-1',
    isCompleted: false
  },
  {
    id: 'job-10',
    company: 'Shopify',
    jobTitle: 'Growth Product Manager',
    industry: 'E-commerce',
    location: 'Toronto, Canada',
    companySize: '5000+',
    isHiring: true,
    recentNews: 'Shopify reports record Q4 with $7.1B in revenue',
    potentialContacts: [
      {
        id: 'contact-10-1',
        name: 'Lisa Wang',
        title: 'Director of Product Growth',
        mutualConnections: 4,
        linkedinUrl: 'linkedin.com/in/lisawang',
        matchScore: 93
      }
    ],
    matchStatus: 'matched',
    selectedContactId: 'contact-10-1',
    isCompleted: false
  },
  {
    id: 'job-11',
    company: 'Discord',
    jobTitle: 'Community Manager',
    industry: 'Social Tech',
    location: 'San Francisco, CA',
    companySize: '1000-5000',
    isHiring: true,
    recentNews: 'Discord launches new monetization features for server owners',
    potentialContacts: [
      {
        id: 'contact-11-1',
        name: 'Alex Turner',
        title: 'Head of Community',
        mutualConnections: 7,
        linkedinUrl: 'linkedin.com/in/alexturner',
        matchScore: 87
      }
    ],
    matchStatus: 'matched',
    selectedContactId: 'contact-11-1',
    isCompleted: false
  },
  {
    id: 'job-12',
    company: 'Framer',
    jobTitle: 'Marketing Manager',
    industry: 'Design Tools',
    location: 'Amsterdam, Netherlands',
    companySize: '100-500',
    isHiring: true,
    recentNews: 'Framer reaches 4M+ users with new AI-powered design features',
    potentialContacts: [
      {
        id: 'contact-12-1',
        name: 'Sophie Nielsen',
        title: 'VP of Marketing',
        mutualConnections: 3,
        linkedinUrl: 'linkedin.com/in/sophienielsen',
        matchScore: 88
      }
    ],
    matchStatus: 'matched',
    selectedContactId: 'contact-12-1',
    isCompleted: false
  },
  {
    id: 'job-13',
    company: 'Airbnb',
    jobTitle: 'Senior Product Manager',
    industry: 'Travel Tech',
    location: 'San Francisco, CA',
    companySize: '5000+',
    isHiring: true,
    recentNews: 'Airbnb introduces AI-powered host matching system',
    potentialContacts: [
      {
        id: 'contact-13-1',
        name: 'Maria Rodriguez',
        title: 'Director of Product',
        mutualConnections: 5,
        linkedinUrl: 'linkedin.com/in/mariarodriguez',
        matchScore: 90
      },
      {
        id: 'contact-13-2',
        name: 'James Wilson',
        title: 'VP of Product',
        mutualConnections: 3,
        linkedinUrl: 'linkedin.com/in/jameswilson',
        matchScore: 95
      },
      {
        id: 'contact-13-3',
        name: 'Anna Chen',
        title: 'Head of Growth',
        mutualConnections: 7,
        linkedinUrl: 'linkedin.com/in/annachen',
        matchScore: 88
      }
    ],
    matchStatus: 'multiple-matches',
    isCompleted: false
  },
  {
    id: 'job-14',
    company: 'Uber',
    jobTitle: 'Engineering Manager',
    industry: 'Transportation',
    location: 'New York, NY',
    companySize: '5000+',
    isHiring: true,
    recentNews: 'Uber expands autonomous vehicle testing to 5 new cities',
    potentialContacts: [
      {
        id: 'contact-14-1',
        name: 'David Kim',
        title: 'VP of Engineering',
        mutualConnections: 4,
        linkedinUrl: 'linkedin.com/in/davidkim',
        matchScore: 93
      },
      {
        id: 'contact-14-2',
        name: 'Sarah Thompson',
        title: 'Director of Engineering',
        mutualConnections: 6,
        linkedinUrl: 'linkedin.com/in/sarahthompson',
        matchScore: 89
      },
      {
        id: 'contact-14-3',
        name: 'Michael Chang',
        title: 'Head of Platform',
        mutualConnections: 2,
        linkedinUrl: 'linkedin.com/in/michaelchang',
        matchScore: 86
      }
    ],
    matchStatus: 'multiple-matches',
    isCompleted: false
  },
  {
    id: 'job-15',
    company: 'DoorDash',
    jobTitle: 'Product Designer',
    industry: 'Food Delivery',
    location: 'San Francisco, CA',
    companySize: '1000-5000',
    isHiring: true,
    recentNews: 'DoorDash launches new restaurant discovery features',
    potentialContacts: [
      {
        id: 'contact-15-1',
        name: 'Lisa Wang',
        title: 'VP of Design',
        mutualConnections: 5,
        linkedinUrl: 'linkedin.com/in/lisawang',
        matchScore: 91
      },
      {
        id: 'contact-15-2',
        name: 'Robert Garcia',
        title: 'Director of UX',
        mutualConnections: 3,
        linkedinUrl: 'linkedin.com/in/robertgarcia',
        matchScore: 87
      }
    ],
    matchStatus: 'multiple-matches',
    isCompleted: false
  },
  {
    id: 'job-16',
    company: 'Twitch',
    jobTitle: 'Marketing Manager',
    industry: 'Gaming',
    location: 'Austin, TX',
    companySize: '1000-5000',
    isHiring: true,
    recentNews: 'Twitch introduces new creator monetization tools',
    potentialContacts: [],
    matchStatus: 'no-match',
    isCompleted: false
  },
  {
    id: 'job-17',
    company: 'Slack',
    jobTitle: 'Business Development',
    industry: 'Productivity',
    location: 'San Francisco, CA',
    companySize: '1000-5000',
    isHiring: true,
    recentNews: 'Slack integrates with 50+ new enterprise applications',
    potentialContacts: [
      {
        id: 'contact-17-1',
        name: 'Jennifer Lee',
        title: 'VP of Partnerships',
        mutualConnections: 8,
        linkedinUrl: 'linkedin.com/in/jenniferlee',
        matchScore: 92
      },
      {
        id: 'contact-17-2',
        name: 'Tom Anderson',
        title: 'Director of Business Development',
        mutualConnections: 4,
        linkedinUrl: 'linkedin.com/in/tomanderson',
        matchScore: 94
      },
      {
        id: 'contact-17-3',
        name: 'Rachel Kim',
        title: 'Head of Strategic Partnerships',
        mutualConnections: 6,
        linkedinUrl: 'linkedin.com/in/rachelkim',
        matchScore: 89
      }
    ],
    matchStatus: 'multiple-matches',
    isCompleted: false
  },
  {
    id: 'job-18',
    company: 'Pinterest',
    jobTitle: 'Data Scientist',
    industry: 'Social Media',
    location: 'San Francisco, CA',
    companySize: '1000-5000',
    isHiring: true,
    recentNews: 'Pinterest AI improvements drive 25% increase in user engagement',
    potentialContacts: [],
    matchStatus: 'no-match',
    isCompleted: false
  }
];

export const applyContactFilter = (jobs: JobOpportunity[], filter: ContactFilter): JobOpportunity[] => {
  return jobs.map(job => {
    const filteredContacts = job.potentialContacts.filter(contact => {
      const title = contact.title.toLowerCase();
      
      // Check if title should be excluded
      if (filter.titlesToExclude.length > 0) {
        const isExcluded = filter.titlesToExclude.some(excludeTitle => {
          const excludeTerm = excludeTitle.toLowerCase().trim();
          return filter.exactMatch 
            ? title === excludeTerm
            : title.includes(excludeTerm);
        });
        if (isExcluded) return false;
      }
      
      // Check if title should be included
      if (filter.titlesToInclude.length > 0) {
        return filter.titlesToInclude.some(includeTitle => {
          const includeTerm = includeTitle.toLowerCase().trim();
          return filter.exactMatch 
            ? title === includeTerm
            : title.includes(includeTerm);
        });
      }
      
      return true;
    });
    
    // If there's a manually selected contact, make sure it's included
    // and respect the existing match status
    if (job.selectedContactId) {
      const selectedContact = job.potentialContacts.find(c => c.id === job.selectedContactId);
      if (selectedContact) {
        // If the selected contact isn't in filtered results, add it back
        if (!filteredContacts.find(c => c.id === job.selectedContactId)) {
          filteredContacts.push(selectedContact);
        }
        
        // Keep the existing match status since user has made a selection
        return {
          ...job,
          potentialContacts: filteredContacts,
          matchStatus: 'matched', // Force matched status for manually selected contacts
          selectedContactId: job.selectedContactId
        };
      }
    }
    
    // Determine match status based on filtered results (only for non-manually-selected jobs)
    let matchStatus: 'matched' | 'multiple-matches' | 'no-match';
    let selectedContactId = job.selectedContactId;
    
    if (filteredContacts.length === 0) {
      matchStatus = 'no-match';
      selectedContactId = undefined;
    } else if (filteredContacts.length === 1) {
      matchStatus = 'matched';
      selectedContactId = filteredContacts[0].id;
    } else {
      matchStatus = 'multiple-matches';
      // Keep existing selection if it's still in filtered results
      if (selectedContactId && !filteredContacts.find(c => c.id === selectedContactId)) {
        selectedContactId = undefined;
      }
    }
    
    return {
      ...job,
      potentialContacts: filteredContacts,
      matchStatus,
      selectedContactId
    };
  });
};
