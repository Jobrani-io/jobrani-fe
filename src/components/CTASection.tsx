import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  const scrollToHeroAndExpand = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('expandHeroEmail'));
    }, 800);
  };
  return (
    <section className="py-24 bg-gradient-subtle relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold">
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Stop Applying. Start Interviewing.
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Automate outreach on LinkedIn, and wake up to traction, not to-dos.
            </p>
          </div>
          
          <div className="space-y-4">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-xl px-12 py-8 animate-scale-in"
              onClick={scrollToHeroAndExpand}
            >
              Start Automating
              <ArrowRight className="w-6 h-6" />
            </Button>
            <p className="text-muted-foreground">
              Free to start. No credit card needed.
            </p>
          </div>
          
          {/* Social proof or additional trust elements could go here */}
        </div>
      </div>
    </section>
  );
};

export default CTASection;