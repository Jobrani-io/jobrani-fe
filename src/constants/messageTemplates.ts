export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
}

export interface SmartToken {
  label: string;
  token: string;
}

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'results-oriented',
    name: 'Results-Oriented Hook',
    content: 'Hi {FirstName}, I saw the {JobTitle} opening and thought it could be a strong match. I\'ve driven similar outcomes in {Industry}, and I\'d love to explore how I might bring that same energy to your team.'
  },
  {
    id: 'professional',
    name: 'Professional & Polished',
    content: 'Hello {FirstName}, I came across the {JobTitle} role and was impressed. My experience in {Industry} aligns well, and I\'d welcome the chance to connect and learn more about your team\'s priorities.'
  },
  {
    id: 'peer-networking',
    name: 'Peer-to-Peer Networking',
    content: 'Hi {FirstName}, I\'m exploring new opportunities in {Industry} and noticed we have some shared connections. I\'d love to connect and learn more about your experience at {Company}.'
  }
];

export const SMART_TOKENS: SmartToken[] = [
  { label: 'First Name', token: '{FirstName}' },
  { label: 'Last Name', token: '{LastName}' },
  { label: 'Company', token: '{Company}' },
  { label: 'Job Title', token: '{JobTitle}' },
  { label: 'Industry', token: '{Industry}' }
];

export const AI_TOKENS: SmartToken[] = [
  { label: 'Hiring Trends', token: '{HiringTrends}' },
  { label: 'Recent News', token: '{RecentAccomplishments}' }
];