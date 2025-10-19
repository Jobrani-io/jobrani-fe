import { ProspectSearchResult, ProspectSearchStats } from '@/types/prospectSearch';

// Large realistic total for display
export const TOTAL_PROSPECT_COUNT = 173419935;

// Generate a batch of mock prospect results
export const generateMockProspects = (startIndex: number = 0, count: number = 50): ProspectSearchResult[] => {
  const prospects: ProspectSearchResult[] = [];
  
  const names = [
    'Sarah Chen', 'Marcus Rodriguez', 'Jennifer Park', 'David Kim', 'Amanda Foster',
    'Robert Chen', 'Lisa Wang', 'Michael Thompson', 'Jessica Martinez', 'Ryan O\'Connor',
    'Emily Davis', 'Alex Johnson', 'Priya Patel', 'James Wilson', 'Rachel Green',
    'Kevin Lee', 'Samantha Brown', 'Daniel Garcia', 'Michelle Liu', 'Chris Anderson',
    'Natalie Taylor', 'Andrew Chang', 'Stephanie Miller', 'Brian Park', 'Lauren Smith',
    'Jason Wu', 'Megan Jones', 'Victor Kumar', 'Ashley Yang', 'Derek Thompson'
  ];
  
  const companies = [
    'Google', 'Microsoft', 'Apple', 'Meta', 'Amazon', 'Netflix', 'Spotify', 'Uber',
    'Airbnb', 'Salesforce', 'LinkedIn', 'Adobe', 'Slack', 'Zoom', 'Dropbox',
    'Stripe', 'Notion', 'Figma', 'Linear', 'Canva', 'Shopify', 'Square', 'Twilio',
    'Datadog', 'Snowflake', 'Atlassian', 'Zendesk', 'HubSpot', 'Okta', 'Palantir'
  ];
  
  const jobTitles = [
    'Senior Marketing Manager', 'VP of Marketing', 'Head of Growth', 'Marketing Director',
    'Chief Marketing Officer', 'Product Marketing Manager', 'Growth Marketing Manager',
    'Digital Marketing Manager', 'Brand Marketing Manager', 'Content Marketing Manager',
    'Marketing Operations Manager', 'Demand Generation Manager', 'Field Marketing Manager',
    'Partner Marketing Manager', 'Event Marketing Manager', 'Social Media Manager',
    'Email Marketing Manager', 'Performance Marketing Manager', 'SEO Manager',
    'Customer Marketing Manager'
  ];
  
  const locations = [
    'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Los Angeles, CA',
    'Boston, MA', 'Chicago, IL', 'Remote', 'Denver, CO', 'Atlanta, GA',
    'Portland, OR', 'Miami, FL', 'Dallas, TX', 'Philadelphia, PA', 'San Diego, CA',
    'Phoenix, AZ', 'Nashville, TN', 'Salt Lake City, UT', 'Raleigh, NC', 'Minneapolis, MN'
  ];
  
  for (let i = 0; i < count; i++) {
    const nameIndex = (startIndex + i) % names.length;
    const companyIndex = (startIndex + i) % companies.length;
    const titleIndex = (startIndex + i) % jobTitles.length;
    const locationIndex = (startIndex + i) % locations.length;
    
    const name = names[nameIndex];
    const company = companies[companyIndex];
    
    prospects.push({
      id: `prospect-${startIndex + i + 1}`,
      name,
      companyName: company,
      jobTitle: jobTitles[titleIndex],
      location: locations[locationIndex],
      linkedinUrl: `linkedin.com/in/${name.toLowerCase().replace(/[^a-z]/g, '')}`,
      isCompleted: false,
      status: 'ready-to-complete'
    });
  }
  
  return prospects;
};

// Get search stats for display
export const getProspectSearchStats = (currentResults: ProspectSearchResult[]): ProspectSearchStats => {
  const completed = currentResults.filter(p => p.isCompleted).length;
  const readyToComplete = currentResults.filter(p => !p.isCompleted).length;
  
  return {
    total: TOTAL_PROSPECT_COUNT,
    previewing: currentResults.length,
    willBeImported: readyToComplete
  };
};