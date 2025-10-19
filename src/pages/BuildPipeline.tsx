
import { useEffect } from "react";
import { useMetaPixel } from "@/hooks/useMetaPixel";
import Header from "@/components/Header";
import { OnboardingFunnel, type FormData } from "@/components/onboarding/OnboardingFunnel";
import { useAuth } from "@/contexts/AuthContext";
import { TrackingService } from "@/services/trackingService";
import { onboardingService } from "@/services/onboardingService";

const BuildPipeline = () => {
  const { trackEvent } = useMetaPixel('969772518529578');
  const { user, session } = useAuth();

  const handleFormComplete = async (data: FormData) => {
    console.log('BuildPipeline: Onboarding funnel completed:', data);
    console.log('BuildPipeline: Current user:', user?.id);
    console.log('BuildPipeline: Tracking conversions...');
    
    try {
      // Use unified onboarding service for consistent data storage
      await onboardingService.completeOnboarding(data);

      // Track Lead event in Meta Pixel
      trackEvent('Lead', {
        job_search_mindset: data.campaignStrategy?.join(', ') || '',
        desired_roles: data.desiredRoles?.join(', ') || '',
        location_preferences: JSON.stringify(data.locationPreferences),
        salary_range: JSON.stringify(data.salaryRange),
      });

      // Track Google Ads conversion with deduplication
      if (user?.id) {
        TrackingService.trackGoogleAdsConversion(user.id, 'onboarding_complete');
      }
      
      console.log('Form data processed successfully:', data);
    } catch (error) {
      console.error('Error processing form data:', error);
      // Error handling is done by the onboarding service
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <OnboardingFunnel onComplete={handleFormComplete} />
        </div>
      </div>
    </div>
  );
};

export default BuildPipeline;
