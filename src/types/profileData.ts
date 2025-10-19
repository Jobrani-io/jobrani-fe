export interface ProfileData {
  // Resume Information
  resumeId?: string;
  resumeFileName?: string;
  
  // Career Preferences
  desiredRoles: string[];
  locationPreferences: {
    remote: boolean;
    hybrid: boolean;
    onsite: boolean;
    cities: string[];
  };
  industryPreferences: string[];
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  
  // Personal Information
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  
  // Highlights and Skills
  personalHighlights: PersonalHighlight[];
  skills: string[];
  
  // Experience Summary
  experienceYears?: number;
  currentTitle?: string;
  education?: string[];
}

export interface PersonalHighlight {
  id: string;
  text: string;
  category: 'achievement' | 'skill' | 'experience' | 'custom';
  isFromResume: boolean;
  isLocked?: boolean;
  order: number;
}

export interface ContentToken {
  id: string;
  label: string;
  value: string;
  category: 'profile' | 'career' | 'highlight' | 'contact';
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  actions: ActionType[];
  order: ActionType[];
  customizations: {
    [key: string]: any;
  };
  contentTokens: ContentToken[];
}

export type ActionType = 'connect' | 'apply' | 'email';

export const defaultProfileData: ProfileData = {
  desiredRoles: [],
  locationPreferences: {
    remote: false,
    hybrid: false,
    onsite: false,
    cities: [],
  },
  industryPreferences: [],
  personalHighlights: [],
  skills: [],
};

// Common job roles for suggestions
export const commonJobRoles = [
  'Software Engineer',
  'Product Manager',
  'Data Scientist',
  'Marketing Manager',
  'Sales Representative',
  'UX Designer',
  'Business Analyst',
  'Project Manager',
  'Operations Manager',
  'DevOps Engineer',
  'Customer Success Manager',
  'Financial Analyst',
  'HR Manager',
  'Content Marketing Manager',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Machine Learning Engineer',
  'Growth Marketing Manager',
  'Account Manager',
];

// Common industries
export const commonIndustries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Consulting',
  'Media & Entertainment',
  'Real Estate',
  'Non-profit',
  'Government',
  'Automotive',
  'Energy',
  'Transportation',
  'Food & Beverage',
  'Fashion',
  'Gaming',
  'Biotechnology',
  'Telecommunications',
  'Marketing & Advertising',
];

// Common cities for job search
export const commonCities = [
  'San Francisco, CA',
  'New York, NY',
  'Seattle, WA',
  'Austin, TX',
  'Boston, MA',
  'Los Angeles, CA',
  'Chicago, IL',
  'Denver, CO',
  'Atlanta, GA',
  'Miami, FL',
  'Portland, OR',
  'Washington, DC',
  'Philadelphia, PA',
  'San Diego, CA',
  'Phoenix, AZ',
  'Dallas, TX',
  'Nashville, TN',
  'Charlotte, NC',
  'Raleigh, NC',
  'Minneapolis, MN',
];