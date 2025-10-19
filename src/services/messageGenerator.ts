import { MESSAGE_TEMPLATES, SMART_TOKENS } from '@/constants/messageTemplates';

export interface MessageGenerationSettings {
  tone: 'results-oriented' | 'peer-to-peer' | 'professional-polished';
  keywords: string[];
  selectedTokens: string[];
}

export interface ProspectData {
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
  industry: string;
}

// Default settings - these would come from Write Module in a real app
const DEFAULT_SETTINGS: MessageGenerationSettings = {
  tone: 'results-oriented',
  keywords: ['React', 'TypeScript', 'Product Strategy', 'User Experience'],
  selectedTokens: ['{FirstName}', '{Company}', '{JobTitle}', '{Industry}']
};

export class MessageGeneratorService {
  private settings: MessageGenerationSettings;

  constructor(settings?: MessageGenerationSettings) {
    this.settings = settings || DEFAULT_SETTINGS;
  }

  updateSettings(newSettings: Partial<MessageGenerationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }

  generateConnectionRequest(prospect: ProspectData): string {
    const templates = {
      'results-oriented': `Hi {FirstName}, I saw your work at {Company} and was impressed by your {JobTitle} role. I've driven similar outcomes in {Industry}, and I'd love to connect and explore potential synergies.`,
      'peer-to-peer': `Hi {FirstName}, I'm exploring new opportunities in {Industry} and noticed we have some shared connections. I'd love to connect and learn more about your experience at {Company}.`,
      'professional-polished': `Hello {FirstName}, I came across your profile and was impressed by your work as {JobTitle} at {Company}. I'd welcome the opportunity to connect and learn more about your team's priorities.`
    };

    return this.applyPersonalization(templates[this.settings.tone], prospect);
  }

  generateFollowUpMessage(prospect: ProspectData): string {
    const templates = {
      'results-oriented': `Hi {FirstName}, following up on my connection request. I've been working on similar challenges in {Industry} and thought you might be interested in discussing potential collaboration opportunities at {Company}.`,
      'peer-to-peer': `Hey {FirstName}, thanks for connecting! I'd love to hear more about what you're working on at {Company} and share some insights from my experience in {Industry}.`,
      'professional-polished': `Hello {FirstName}, thank you for accepting my connection request. I'd be interested in learning more about your work as {JobTitle} and exploring how we might collaborate.`
    };

    return this.applyPersonalization(templates[this.settings.tone], prospect);
  }

  generateInMail(prospect: ProspectData): string {
    const templates = {
      'results-oriented': `Hi {FirstName}, I'm reaching out because your work as {JobTitle} at {Company} caught my attention. I've driven significant results in {Industry} and believe there could be valuable synergies to explore.`,
      'peer-to-peer': `Hi {FirstName}, I hope this message finds you well. I've been following {Company}'s work in {Industry} and would love to connect to share insights and learn from your experience.`,
      'professional-polished': `Dear {FirstName}, I'm writing to introduce myself and express my interest in your work at {Company}. My background in {Industry} aligns well with your team's objectives, and I'd welcome the opportunity to discuss further.`
    };

    return this.applyPersonalization(templates[this.settings.tone], prospect);
  }

  generateMessageVariations(actionType: string, prospect: ProspectData): string[] {
    const variations: string[] = [];
    
    switch (actionType) {
      case 'connection-request':
        variations.push(this.generateConnectionRequest(prospect));
        break;
      case 'send-message':
        variations.push(this.generateFollowUpMessage(prospect));
        variations.push(this.generateInMail(prospect));
        break;
      default:
        variations.push(this.generateConnectionRequest(prospect));
    }

    return variations;
  }

  private applyPersonalization(template: string, prospect: ProspectData): string {
    let message = template;

    // Apply selected tokens
    if (this.settings.selectedTokens.includes('{FirstName}')) {
      message = message.replace(/{FirstName}/g, prospect.firstName);
    } else {
      message = message.replace(/{FirstName}/g, 'there');
    }

    if (this.settings.selectedTokens.includes('{LastName}')) {
      message = message.replace(/{LastName}/g, prospect.lastName);
    }

    if (this.settings.selectedTokens.includes('{Company}')) {
      message = message.replace(/{Company}/g, prospect.company);
    } else {
      message = message.replace(/{Company}/g, 'your company');
    }

    if (this.settings.selectedTokens.includes('{JobTitle}')) {
      message = message.replace(/{JobTitle}/g, prospect.jobTitle);
    } else {
      message = message.replace(/{JobTitle}/g, 'your role');
    }

    if (this.settings.selectedTokens.includes('{Industry}')) {
      message = message.replace(/{Industry}/g, prospect.industry);
    } else {
      message = message.replace(/{Industry}/g, 'the industry');
    }

    return message;
  }

  getPreviewMessage(actionType: string, messageType?: 'message' | 'inmail'): string {
    const sampleProspect: ProspectData = {
      firstName: 'Jane',
      lastName: 'Smith',
      company: 'TechCorp',
      jobTitle: 'Product Manager',
      industry: 'Technology'
    };

    switch (actionType) {
      case 'connection-request':
        return this.generateConnectionRequest(sampleProspect);
      case 'send-message':
        return messageType === 'inmail' 
          ? this.generateInMail(sampleProspect)
          : this.generateFollowUpMessage(sampleProspect);
      default:
        return this.generateConnectionRequest(sampleProspect);
    }
  }
}

// Singleton instance
export const messageGenerator = new MessageGeneratorService();