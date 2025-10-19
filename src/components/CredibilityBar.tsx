import { 
  siDatadog, siClickup, siAmericanexpress, 
  siZillow, siMeta, siNetflix, siSalesforce
} from 'simple-icons';

const companies = [
  { name: "Meta", icon: siMeta },
  { name: "Datadog", icon: siDatadog },
  { name: "ClickUp", icon: siClickup },
  { name: "American Express", icon: siAmericanexpress },
  { name: "Netflix", icon: siNetflix },
  { name: "Salesforce", icon: siSalesforce },
  { name: "Zillow", icon: siZillow },
];

const CredibilityBar = () => {
  // Create multiple copies for seamless infinite scroll
  const duplicatedCompanies = [...companies, ...companies];

  return (
    <div className="py-8 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground font-medium">
            Trusted by job seekers interviewing at companies
          </p>
        </div>
        
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll">
            {duplicatedCompanies.map((company, index) => (
              <div
                key={`${company.name}-${index}`}
                className="flex-shrink-0 mx-4"
              >
                <div className="flex items-center space-x-3 px-6 py-4 bg-background/50 rounded-lg border border-border/50 backdrop-blur-sm whitespace-nowrap">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-foreground/70"
                    aria-label={`${company.name} logo`}
                  >
                    <path d={company.icon.path} />
                  </svg>
                  <span className="font-semibold text-foreground">{company.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CredibilityBar;