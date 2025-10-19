import { JobContact } from '@/data/jobOpportunities';

export interface EnhancedJobContact {
  id: string;
  name: string;
  title: string;
  company: string;
  matchScore: number;
  isHiringManager: boolean;
  confidence: number;
  isPrimary: boolean;
}

// Title patterns for hiring manager identification
const HIRING_MANAGER_PATTERNS = [
  /director/i, /vp|vice president/i, /head of/i, /manager/i, /lead/i, 
  /chief/i, /cto|ceo|coo|cfo/i, /founder/i, /owner/i, /principal/i,
  /supervisor/i, /team lead/i
];

export class ContactIntelligenceService {
  /**
   * Check if a contact is likely a hiring manager
   */
  static isHiringManager(contact: JobContact): { isHiringManager: boolean; confidence: number } {
    const title = contact.title.toLowerCase();
    
    // Check hiring manager patterns
    for (const pattern of HIRING_MANAGER_PATTERNS) {
      if (pattern.test(title)) {
        const confidence = this.calculateConfidence(title, pattern);
        return { isHiringManager: true, confidence };
      }
    }
    
    return { isHiringManager: false, confidence: 0.2 };
  }

  /**
   * Calculate confidence score based on title specificity
   */
  private static calculateConfidence(title: string, pattern: RegExp): number {
    // Higher confidence for more specific leadership titles
    if (pattern.source.includes('director|vp|head|chief|cto|ceo')) return 0.9;
    if (pattern.source.includes('manager|lead|principal')) return 0.8;
    if (pattern.source.includes('founder|owner')) return 0.85;
    
    return 0.7;
  }

  /**
   * Generate rationale for hiring manager selection
   */
  static generateRationale(contact: EnhancedJobContact, allContacts: EnhancedJobContact[]): string {
    if (!contact.isHiringManager) {
      return "No clear hiring manager identified";
    }

    const title = contact.title.toLowerCase();
    
    // Check for specific rationales
    if (title.includes('ceo') || title.includes('founder')) {
      const hasRelevantManager = allContacts.some(c => 
        c.id !== contact.id && c.isHiringManager && c.confidence > contact.confidence
      );
      if (!hasRelevantManager) {
        return "CEO likely owns function; no relevant manager listed";
      }
      return "Senior leadership role";
    }
    
    if (title.includes('cro') || title.includes('chief revenue')) {
      return "CRO likely oversees sales/marketing functions";
    }
    
    if (title.includes('vp') || title.includes('vice president')) {
      return "VP-level role indicates hiring authority";
    }
    
    if (title.includes('director') || title.includes('head of')) {
      return "Director/Head role suggests decision-making authority";
    }
    
    if (title.includes('chief of staff')) {
      return "Chief of Staff typically has hiring input";
    }
    
    if (title.includes('manager') || title.includes('lead')) {
      return "Management role indicates hiring responsibility";
    }
    
    return "Leadership title suggests hiring authority";
  }

  /**
   * Enhance job contacts with hiring manager identification
   */
  static enhanceContacts(contacts: JobContact[]): EnhancedJobContact[] {
    return contacts.map((contact, index) => {
      const { isHiringManager, confidence } = this.isHiringManager(contact);
      
      return {
        id: contact.id,
        name: contact.name,
        title: contact.title,
        company: '', // JobContact doesn't have company field
        matchScore: contact.matchScore,
        isHiringManager,
        confidence,
        isPrimary: index === 0 // First contact is primary by default
      };
    });
  }

  /**
   * Select best hiring manager contact
   */
  static selectBestHiringManager(enhancedContacts: EnhancedJobContact[]): EnhancedJobContact | null {
    if (enhancedContacts.length === 0) return null;

    // First, try to find hiring managers with high confidence
    const hiringManagers = enhancedContacts
      .filter(c => c.isHiringManager && c.confidence > 0.6)
      .sort((a, b) => b.matchScore - a.matchScore);

    if (hiringManagers.length > 0) {
      return hiringManagers[0];
    }

    // Fallback to highest match score
    const sortedByScore = [...enhancedContacts].sort((a, b) => b.matchScore - a.matchScore);
    return sortedByScore[0];
  }

  /**
   * Get hiring manager display information
   */
  static getHiringManagerInfo(isHiringManager: boolean, confidence: number) {
    if (isHiringManager) {
      return {
        label: 'Hiring Manager',
        description: 'Decision maker for the role',
        icon: '👑',
        badgeVariant: 'default' as const
      };
    }
    
    return {
      label: 'Other Contact',
      description: 'Team member or other contact',
      icon: '👤',
      badgeVariant: 'secondary' as const
    };
  }
}