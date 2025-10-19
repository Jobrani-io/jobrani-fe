interface LinkedInCredentials {
  email: string;
  password: string;
}

interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  headline?: string;
  industry?: string;
  profilePicture?: string;
}

interface LinkedInAuthResponse {
  success: boolean;
  message: string;
  accessToken: string;
  profile: LinkedInProfile;
  expiresIn: number;
}

interface ApiErrorResponse {
  success: false;
  error: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

class LinkedInApiService {
  private static readonly BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'http://98.80.244.251:3000'
    : 'http://98.80.244.251:3000';

  /**
   * Start LinkedIn OAuth 2.0 authentication flow
   */
  static async startOAuthFlow(): Promise<{ authUrl: string; state: string }> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/linkedin/oauth/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to start OAuth flow');
      }

      return data;
    } catch (error) {
      console.error('LinkedIn OAuth start error:', error);
      throw error;
    }
  }

  /**
   * Handle OAuth callback (for demonstration - typically handled by backend)
   */
  static async handleOAuthCallback(code: string, state: string): Promise<LinkedInAuthResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/linkedin/callback?code=${code}&state=${state}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'OAuth callback failed');
      }

      return data;
    } catch (error) {
      console.error('LinkedIn OAuth callback error:', error);
      throw error;
    }
  }

  /**
   * Get LinkedIn OAuth authorization URL
   */
  static async getAuthUrl(): Promise<{ authUrl: string }> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/linkedin/auth-url`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get authorization URL');
      }

      return data;
    } catch (error) {
      console.error('Error getting LinkedIn auth URL:', error);
      throw error;
    }
  }

  /**
   * Validate LinkedIn access token
   */
  static async validateToken(accessToken: string): Promise<{ valid: boolean }> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/linkedin/validate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Token validation failed');
      }

      return data;
    } catch (error) {
      console.error('Token validation error:', error);
      throw error;
    }
  }

  /**
   * Get user profile using access token
   */
  static async getProfile(accessToken: string): Promise<{ profile: LinkedInProfile }> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/linkedin/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get profile');
      }

      return data;
    } catch (error) {
      console.error('Error getting LinkedIn profile:', error);
      throw error;
    }
  }

  /**
   * Check if user has a valid LinkedIn connection
   */
  static async checkConnection(): Promise<boolean> {
    try {
      const accessToken = localStorage.getItem('linkedin_access_token');
      if (!accessToken) {
        return false;
      }

      const result = await this.validateToken(accessToken);
      return result.valid;
    } catch (error) {
      console.error('Error checking LinkedIn connection:', error);
      return false;
    }
  }

  /**
   * Disconnect LinkedIn account
   */
  static async disconnect(): Promise<void> {
    try {
      // Remove stored token
      localStorage.removeItem('linkedin_access_token');
      localStorage.removeItem('linkedin_profile');
      
      // In a real app, you might also call an API endpoint to revoke the token
      console.log('LinkedIn account disconnected');
    } catch (error) {
      console.error('Error disconnecting LinkedIn account:', error);
      throw error;
    }
  }

  /**
   * Get stored LinkedIn profile from localStorage
   */
  static getStoredProfile(): LinkedInProfile | null {
    try {
      const profileData = localStorage.getItem('linkedin_profile');
      return profileData ? JSON.parse(profileData) : null;
    } catch (error) {
      console.error('Error getting stored profile:', error);
      return null;
    }
  }

  /**
   * Store LinkedIn profile in localStorage
   */
  static storeProfile(profile: LinkedInProfile): void {
    try {
      localStorage.setItem('linkedin_profile', JSON.stringify(profile));
    } catch (error) {
      console.error('Error storing profile:', error);
    }
  }
}

export default LinkedInApiService;
export type { LinkedInCredentials, LinkedInProfile, LinkedInAuthResponse };
