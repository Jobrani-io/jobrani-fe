import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Linkedin, CheckCircle, ExternalLink, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LinkedInOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (accessToken: string, profile?: any) => void;
}

export const LinkedInOAuthModal: React.FC<LinkedInOAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  // Check for OAuth callback when component mounts or modal opens
  useEffect(() => {
    checkForOAuthCallback();
  }, [isOpen]);

  const checkForOAuthCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const linkedinSuccess = urlParams.get('linkedin_success');
    const linkedinData = urlParams.get('linkedin_data');
    const linkedinError = urlParams.get('linkedin_error');

    // Handle OAuth error
    if (linkedinError) {
      const errorMessage = decodeURIComponent(linkedinError);
      setError(`LinkedIn authorization failed: ${errorMessage}`);
      toast({
        variant: "destructive",
        title: "LinkedIn Authorization Failed",
        description: errorMessage,
      });
      
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    // Handle OAuth success
    if (linkedinSuccess === 'true' && linkedinData) {
      setIsLoading(true);
      try {
        // Decode the data from URL parameters
        const data = JSON.parse(decodeURIComponent(linkedinData));

        // Store access token
        localStorage.setItem('linkedin_access_token', data.accessToken);
        
        // Store profile if provided
        if (data.profile) {
          localStorage.setItem('linkedin_profile', JSON.stringify(data.profile));
        }

        setIsConnected(true);
        toast({
          title: "LinkedIn Connected Successfully",
          description: `Welcome ${data.profile?.firstName || 'User'}! Your LinkedIn account has been connected.`,
        });

        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);

        // Auto-close modal after showing success state
        setTimeout(() => {
          onSuccess(data.accessToken, data.profile);
          handleClose();
        }, 2000);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to process LinkedIn data';
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleStartOAuth = async () => {
    setIsLoading(true);
    setError('');

    try {
      const backendUrl = process.env.NODE_ENV === 'production' 
        ? 'http://98.80.244.251:3000' 
        : 'http://98.80.244.251:3000';
      
      const response = await fetch(`${backendUrl}/api/linkedin/oauth/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to initialize OAuth');
      }

      // Redirect to LinkedIn OAuth page
      window.location.href = data.authUrl;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start OAuth flow';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "OAuth Initialization Failed",
        description: errorMessage,
      });
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError('');
      setIsConnected(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Linkedin className="h-5 w-5 text-[#0077B5]" />
            Connect LinkedIn Account
          </DialogTitle>
          <DialogDescription>
            {isConnected 
              ? "Successfully connected to LinkedIn!" 
              : "Securely connect your LinkedIn account using OAuth 2.0 authentication."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isConnected ? (
            /* Success State */
            <div className="text-center py-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                LinkedIn Connected Successfully!
              </h3>
              <p className="text-sm text-green-700">
                Your LinkedIn account is now connected and ready to use for prospecting.
              </p>
            </div>
          ) : (
            /* OAuth Flow */
            <>
              {/* OAuth Flow Explanation */}
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">🔒 Secure OAuth Authentication</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    You'll be redirected to LinkedIn's official login page. We never see your password.
                  </p>
                  <div className="space-y-2 text-xs text-blue-600">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      <span>Click "Connect with LinkedIn" below</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      <span>Login to LinkedIn in the new window</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      <span>Authorize our app to access your profile</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      <span>You'll be redirected back here automatically</span>
                    </div>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* OAuth Button */}
                <Button
                  onClick={handleStartOAuth}
                  disabled={isLoading}
                  className="w-full bg-[#0077B5] hover:bg-[#005885] text-white py-3"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirecting to LinkedIn...
                    </>
                  ) : (
                    <>
                      <Linkedin className="w-5 h-5 mr-2" />
                      Connect with LinkedIn
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                {/* Cancel Button */}
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinkedInOAuthModal;