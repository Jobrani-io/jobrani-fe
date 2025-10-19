import CTASection from "@/components/CTASection";
import FAQSection from "@/components/FAQSection";
import FeaturesSection from "@/components/FeaturesSection";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TestimonialSection from "@/components/TestimonialSection";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user, checkIfOnboardingCompleted } = useAuth();
  const navigate = useNavigate();

  // Redirect logged-in users to appropriate route based on onboarding status
  useEffect(() => {
    if (user?.id) {
      (async () => {
        const isOnboardingCompleted = await checkIfOnboardingCompleted(user.id);
        if (isOnboardingCompleted) {
          navigate("/hub");
        } else {
          navigate("/hub-onboarding");
        }
      })();
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <TestimonialSection />
      <FAQSection />
      <CTASection />
    </div>
  );
};

export default Index;
