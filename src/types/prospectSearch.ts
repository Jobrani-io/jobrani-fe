export interface ProspectSearchResult {
  id: string;
  name: string;
  companyName: string;
  jobTitle: string;
  location: string;
  linkedinUrl: string;
  isCompleted: boolean;
  status: 'ready-to-complete' | 'completed';
}

export interface ProspectSearchStats {
  total: number;
  previewing: number;
  willBeImported: number;
}