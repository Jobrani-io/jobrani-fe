import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from 'lucide-react';

const sampleJobs = [
  { id: 1, company: "Google", jobTitle: "Software Engineer", location: "Mountain View, CA", postedOn: "1 day ago" },
  { id: 2, company: "Microsoft", jobTitle: "Product Manager", location: "Redmond, WA", postedOn: "2 days ago" },
  { id: 3, company: "Apple", jobTitle: "iOS Developer", location: "Cupertino, CA", postedOn: "3 days ago" },
  { id: 4, company: "Meta", jobTitle: "Data Scientist", location: "Menlo Park, CA", postedOn: "4 days ago" },
  { id: 5, company: "Amazon", jobTitle: "DevOps Engineer", location: "Seattle, WA", postedOn: "2 days ago" },
  { id: 6, company: "Netflix", jobTitle: "Frontend Engineer", location: "Los Gatos, CA", postedOn: "5 days ago" },
  { id: 7, company: "Spotify", jobTitle: "Backend Developer", location: "New York, NY", postedOn: "3 days ago" },
  { id: 8, company: "Uber", jobTitle: "DevOps Engineer", location: "San Francisco, CA", postedOn: "1 week ago" },
  { id: 9, company: "Airbnb", jobTitle: "UX Designer", location: "San Francisco, CA", postedOn: "2 weeks ago" },
  { id: 10, company: "Salesforce", jobTitle: "Solutions Engineer", location: "San Francisco, CA", postedOn: "6 days ago" },
  { id: 11, company: "Tesla", jobTitle: "Full Stack Engineer", location: "Austin, TX", postedOn: "1 day ago" },
  { id: 12, company: "Stripe", jobTitle: "Platform Engineer", location: "San Francisco, CA", postedOn: "3 days ago" },
  { id: 13, company: "Shopify", jobTitle: "Software Developer", location: "Ottawa, ON", postedOn: "4 days ago" },
  { id: 14, company: "Twilio", jobTitle: "API Engineer", location: "San Francisco, CA", postedOn: "1 week ago" },
  { id: 15, company: "Zoom", jobTitle: "Frontend Developer", location: "San Jose, CA", postedOn: "5 days ago" },
];

const LiveProspectPreview: React.FC = () => {
  const [highlightedRowIndex, setHighlightedRowIndex] = useState<number | null>(null);
  const [resultCount, setResultCount] = useState(14284657);
  const [isSearching, setIsSearching] = useState(false);

  // Limit to 10 jobs across all devices for better UI
  const displayJobs = sampleJobs.slice(0, 10);

  useEffect(() => {
    const interval = setInterval(() => {
      // Cycle through highlighting different rows
      setHighlightedRowIndex((prev) => {
        if (prev === null) return 0;
        return (prev + 1) % displayJobs.length;
      });

      // Occasionally simulate new search results
      if (Math.random() < 0.3) {
        setIsSearching(true);
        setTimeout(() => {
          setResultCount(prev => prev + Math.floor(Math.random() * 1000));
          setIsSearching(false);
        }, 1000);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [displayJobs.length]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-background/80 to-muted/30 rounded-lg border overflow-hidden flex flex-col max-h-[80vh] md:max-h-full">
      <div className="p-2 md:p-4 flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="mb-2 md:mb-4 flex-shrink-0">
          <h3 className="text-sm md:text-lg font-semibold mb-1">Preview</h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            {isSearching ? (
              <span className="flex items-center gap-2">
                <div className="animate-pulse h-2 w-2 bg-primary rounded-full"></div>
                Searching...
              </span>
            ) : (
              `Previewing ${displayJobs.length} of ${resultCount.toLocaleString()} results. 100 will be imported.`
            )}
          </p>
        </div>
        
        {/* Table */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8 md:w-12 px-1 md:px-4 text-xs md:text-sm">#</TableHead>
                  <TableHead className="min-w-[80px] md:min-w-[120px] px-1 md:px-4 text-xs md:text-sm">Company</TableHead>
                  <TableHead className="min-w-[100px] md:min-w-[140px] px-1 md:px-4 text-xs md:text-sm">Job Title</TableHead>
                  <TableHead className="min-w-[80px] md:min-w-[120px] px-1 md:px-4 text-xs md:text-sm">Location</TableHead>
                  <TableHead className="w-20 md:w-32 px-1 md:px-4">
                    <div className="flex items-center gap-1">
                      <span className="text-xs md:text-sm">Posted</span>
                      <Calendar className="h-2 w-2 md:h-3 md:w-3" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayJobs.map((job, index) => (
                  <TableRow 
                    key={job.id} 
                    className={`h-8 md:h-10 transition-all duration-300 ${
                      highlightedRowIndex === index 
                        ? "bg-primary/10 border-l-2 border-l-primary" 
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <TableCell className="font-mono text-xs md:text-sm text-muted-foreground py-1 md:py-2 px-1 md:px-4">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium py-1 md:py-2 px-1 md:px-4">
                      <div className="flex items-center gap-1 md:gap-2">
                        <span className="whitespace-nowrap text-xs md:text-sm">{job.company}</span>
                        {highlightedRowIndex === index && (
                          <div className="h-1.5 w-1.5 md:h-2 md:w-2 bg-primary rounded-full animate-pulse flex-shrink-0"></div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-1 md:py-2 px-1 md:px-4">
                      <span className="whitespace-nowrap text-xs md:text-sm">{job.jobTitle}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground py-1 md:py-2 px-1 md:px-4">
                      <span className="whitespace-nowrap text-xs md:text-sm">{job.location}</span>
                    </TableCell>
                    <TableCell className="text-xs md:text-sm text-muted-foreground py-1 md:py-2 px-1 md:px-4">
                      <div className="flex items-center gap-1">
                        <span className="whitespace-nowrap">{job.postedOn.replace(' ago', '')}</span>
                        {job.postedOn.includes("1 day ago") && (
                          <Badge variant="outline" className="text-[10px] md:text-xs px-0.5 md:px-1 py-0 flex-shrink-0">New</Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveProspectPreview;