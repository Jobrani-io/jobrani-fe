import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useResumeProcessing } from '@/hooks/useResumeProcessing';

export const BackgroundProcessingIndicator = () => {
  const { processingJobs } = useResumeProcessing();
  
  const activeJobs = processingJobs.filter(job => 
    job.status === 'pending' || job.status === 'processing'
  );
  
  if (activeJobs.length === 0) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {activeJobs.map((job) => (
        <Card key={job.id} className="mb-2 border-primary/20 bg-background/95 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {job.status === 'pending' || job.status === 'processing' ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : job.status === 'completed' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  Processing {job.fileName}
                </div>
                
                {job.progress !== undefined && (
                  <div className="mt-2">
                    <Progress value={job.progress} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">
                      {job.progress}% complete
                    </div>
                  </div>
                )}
                
                {job.status === 'processing' && !job.progress && (
                  <div className="text-xs text-muted-foreground">
                    Analyzing resume...
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};