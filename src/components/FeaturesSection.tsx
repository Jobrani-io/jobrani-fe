import { useState, useEffect } from "react";
import { Target, Brain, Users, CheckCircle, FolderOpen, Building2, User, ChevronDown, MapPin, Clock, Plus, Zap } from "lucide-react";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import HeroDashboard from "./HeroDashboard";
import LiveMessagePreview from "./LiveMessagePreview";
import LiveProspectPreview from "./LiveProspectPreview";
import SimpleWorkflowPreview from "./SimpleWorkflowPreview";

const pipelineSteps = [
  {
    id: 1,
    icon: Target,
    title: "Prospect",
    mobileTitle: "Prospect",
    description: "Build your target list from scratch or import saved jobs.",
    mobileDescription: "Build lists from scratch or import saved jobs.",
    details: "Build your pipeline with precision targeting and smart company discovery tools.",
    visualPlaceholder: "linkedin-job-board-interface"
  },
  {
    id: 2,
    icon: Zap,
    title: "Campaign",
    mobileTitle: "Campaign", 
    description: "Reach 100+ job prospects a week — execs, recruiters, peers — with personalized messages and workflows.",
    mobileDescription: "Reach 100+ job prospects a week with personalized messages and workflows.",
    details: "Automated sending with human oversight and approval workflows for maximum effectiveness.",
    visualPlaceholder: "hero-dashboard"
  },
  {
    id: 3,
    icon: Brain,
    title: "Write",
    mobileTitle: "Write",
    description: "AI generates personalized messages for every contact — or write your own. No two messages are the same.",
    mobileDescription: "AI generates custom messages for contacts — or write your own. No two messages are the same.",
    details: "Advanced AI analyzes company data and prospect profiles to create compelling, personalized messages.",
    visualPlaceholder: "ai-personalization-interface"
  },
  {
    id: 4,
    icon: CheckCircle,
    title: "Track",
    mobileTitle: "Track",
    description: "See what's working and what's not. Measure reply rates, follow-ups, and optimize your outreach strategy.",
    mobileDescription: "See what's working and what's not. Measure reply rates, follow-ups, and optimize your outreach.",
    details: "Real-time analytics and optimization tools to maximize your outreach effectiveness.",
    visualPlaceholder: "analytics-dashboard-interface"
  }
];

const mockOutreachProspects = [
  {
    id: 1,
    company: "Stripe",
    jobTitle: "Senior Software Engineer",
    hiringManager: "Sarah Chen",
    status: "Pending",
    statusColor: "bg-yellow-100 text-yellow-800 border-yellow-200",
    nextAction: "Send Follow-up"
  },
  {
    id: 4,
    company: "Vercel",
    jobTitle: "DevOps Engineer",
    hiringManager: "David Park",
    status: "Pending",
    statusColor: "bg-yellow-100 text-yellow-800 border-yellow-200",
    nextAction: "Send Message"
  },
  {
    id: 2,
    company: "Figma",
    jobTitle: "Product Manager",
    hiringManager: "Michael Rodriguez",
    status: "Live",
    statusColor: "bg-blue-100 text-blue-800 border-blue-200",
    nextAction: "Wait for Response"
  },
  {
    id: 5,
    company: "Notion",
    jobTitle: "UX Designer",
    hiringManager: "Lisa Wang",
    status: "Live",
    statusColor: "bg-blue-100 text-blue-800 border-blue-200",
    nextAction: "Wait for Response"
  },
  {
    id: 3,
    company: "Linear",
    jobTitle: "Frontend Developer",
    hiringManager: "Emily Johnson",
    status: "Responded",
    statusColor: "bg-green-100 text-green-800 border-green-200",
    nextAction: "Schedule Interview"
  }
];

const mockJobListings = [
  {
    id: 1,
    company: "Stripe",
    jobTitle: "Senior Software Engineer",
    location: "San Francisco, CA",
    posted: "2 days ago",
    type: "Full-time",
    salary: "$180k - $250k",
    applicants: "47 applicants"
  },
  {
    id: 2,
    company: "Figma",
    jobTitle: "Product Manager",
    location: "New York, NY",
    posted: "1 day ago",
    type: "Full-time",
    salary: "$160k - $220k",
    applicants: "23 applicants"
  },
  {
    id: 3,
    company: "Linear",
    jobTitle: "Frontend Developer",
    location: "Remote",
    posted: "3 days ago",
    type: "Full-time",
    salary: "$140k - $180k",
    applicants: "12 applicants"
  },
  {
    id: 4,
    company: "Vercel",
    jobTitle: "DevOps Engineer",
    location: "San Francisco, CA",
    posted: "5 days ago",
    type: "Full-time",
    salary: "$150k - $200k",
    applicants: "31 applicants"
  }
];

// Helper function to render illustrations
const renderIllustration = (stepId: number) => {
  switch (stepId) {
    case 1:
      return <LiveProspectPreview />;
    
    case 2:
      return <SimpleWorkflowPreview selectedActions={['apply', 'connect', 'email']} actionOrder={['apply', 'connect', 'email']} />;
    
    case 3:
      return <LiveMessagePreview />;
    
    case 4:
      return (
        <div className="space-y-4">
          {/* Metrics Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                title: 'Connections',
                value: 342,
                change: '+12%',
                color: 'hsl(217 91% 60%)',
                bgColor: 'hsl(217 91% 60% / 0.1)'
              },
              {
                title: 'Accepted',
                value: 187,
                change: '54.7%',
                color: 'hsl(142 76% 36%)',
                bgColor: 'hsl(142 76% 36% / 0.1)'
              },
              {
                title: 'Messages',
                value: 298,
                change: '+8%',
                color: 'hsl(14 90% 55%)',
                bgColor: 'hsl(14 90% 55% / 0.1)'
              },
              {
                title: 'Replies',
                value: 124,
                change: '41.6%',
                color: 'hsl(262 90% 50%)',
                bgColor: 'hsl(262 90% 50% / 0.1)'
              },
              {
                title: 'InMails',
                value: 89,
                change: '+15%',
                color: 'hsl(190 90% 50%)',
                bgColor: 'hsl(190 90% 50% / 0.1)'
              },
              {
                title: 'InMail Replies',
                value: 34,
                change: '38.2%',
                color: 'hsl(222 84% 4.9%)',
                bgColor: 'hsl(222 84% 4.9% / 0.1)'
              }
            ].map((metric, index) => (
              <div key={index} className="bg-background/60 rounded-lg border p-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">{metric.title}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-lg font-bold text-foreground">{metric.value.toLocaleString()}</p>
                    <span 
                      className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                      style={{
                        color: metric.color,
                        backgroundColor: metric.bgColor
                      }}
                    >
                      {metric.change}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mini Chart */}
          <div className="bg-background/60 rounded-lg border p-4">
            <div className="text-sm font-medium mb-3">Performance Trends</div>
            <div className="relative h-24 w-full bg-muted/20 rounded">
              {/* Chart Bars */}
              <div className="absolute bottom-0 left-0 right-0 h-full flex items-end justify-between px-3 pb-1">
                {[
                  { value: 45, day: 'Mon' },
                  { value: 52, day: 'Tue' },
                  { value: 38, day: 'Wed' },
                  { value: 67, day: 'Thu' },
                  { value: 71, day: 'Fri' },
                  { value: 59, day: 'Sat' },
                  { value: 63, day: 'Sun' }
                ].map((bar, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="bg-primary rounded-t-sm w-3 transition-all duration-300 hover:bg-primary/80"
                      style={{ 
                        height: `${(bar.value / 71) * 60}px`
                      }}
                    />
                    <span className="text-xs text-muted-foreground mt-1">{bar.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    
    default:
      return null;
  }
};

const FeaturesSection = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [progress, setProgress] = useState(0);
  
  // Auto-progression logic
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Move to next tab
          const currentId = parseInt(activeTab);
          const nextId = currentId >= pipelineSteps.length ? 1 : currentId + 1;
          setActiveTab(nextId.toString());
          return 0; // Reset progress
        }
        return prev + (100 / 70); // 7 seconds = 70 intervals of 100ms
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Reset progress when user manually changes tab
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setProgress(0);
  };

  return (
    <section className="py-8 md:py-16 relative" style={{
      background: 'linear-gradient(to bottom, hsl(var(--gradient-subtle)), hsl(var(--background)) 30%, hsl(var(--background)) 70%, hsl(var(--gradient-subtle)))'
    }}>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <TooltipProvider>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              {/* Tab Navigation */}
              <div className="flex flex-col space-y-3 md:space-y-4">
                <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-transparent border border-border/50 rounded-lg">
                  {pipelineSteps.map((step) => (
                    <TabsTrigger 
                      key={step.id}
                      value={step.id.toString()}
                      className="flex flex-col items-center space-y-1 md:space-y-2 h-auto py-2 md:py-2 px-2 md:px-3 border-2 border-transparent rounded-md transition-all duration-200 hover:bg-muted/50"
                      style={{
                        backgroundColor: activeTab === step.id.toString() ? 'hsl(14 90% 95%)' : 'transparent',
                        color: activeTab === step.id.toString() ? 'hsl(14 90% 25%)' : 'inherit',
                        borderColor: activeTab === step.id.toString() ? 'hsl(14 90% 75%)' : 'transparent',
                        fontWeight: activeTab === step.id.toString() ? '600' : '500',
                        transform: activeTab === step.id.toString() ? 'scale(1.02)' : 'scale(1)',
                        boxShadow: activeTab === step.id.toString() ? '0 10px 25px -5px hsl(14 90% 55% / 0.3)' : 'none'
                      }}
                      onClick={() => {
                        console.log('Tab clicked:', step.id, 'Current activeTab:', activeTab);
                        handleTabChange(step.id.toString());
                      }}
                    >
                      <step.icon className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-xs md:text-sm font-medium">{step.title}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Tab Content - Visual Demo Area */}
                <div className="w-full">
                  {pipelineSteps.map((step) => (
                    <TabsContent 
                      key={step.id} 
                      value={step.id.toString()} 
                      className="mt-0 focus-visible:outline-none focus-visible:ring-0"
                    >
                      {/* Description Above Demo */}
                      <div className="mb-2 md:mb-2 text-center">
                        {/* Mobile Description */}
                        <p className="block md:hidden text-muted-foreground leading-snug max-w-xl mx-auto text-sm">
                          {step.mobileDescription}
                        </p>
                        {/* Desktop Description */}
                        <p className="hidden md:block text-muted-foreground leading-relaxed max-w-2xl mx-auto text-base">
                          {step.description}
                        </p>
                      </div>
                      
                      <div className="bg-gradient-subtle rounded-2xl border border-border overflow-hidden min-h-[400px] md:min-h-[450px] transition-all duration-500">
                        {/* Visual Demo - Full Container */}
                        <div className="h-full p-4 md:p-4 animate-fade-in">
                          {renderIllustration(step.id)}
                        </div>
                      </div>
                      
                      {/* Progress Bar Below Demo */}
                      <div className="w-full h-1 bg-muted rounded-full overflow-hidden mt-4 md:mt-6">
                        <div 
                          className="h-full bg-primary transition-all duration-100 ease-linear"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </TabsContent>
                  ))}
                </div>
              </div>
            </Tabs>
          </TooltipProvider>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;