-- Create launched_applications table for tracking individual job applications
CREATE TABLE public.launched_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_id UUID REFERENCES public.linkedin_saved_jobs(id),
  prospect_id UUID REFERENCES public.linkedin_saved_people(id),
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  prospect_name TEXT,
  prospect_title TEXT,
  workflow_sequence JSONB NOT NULL DEFAULT '[]'::jsonb,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('self-apply', 'apply-for-me')),
  status TEXT NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'failed')),
  messages_sent JSONB DEFAULT '[]'::jsonb,
  launched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.launched_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own launched applications" 
ON public.launched_applications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own launched applications" 
ON public.launched_applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own launched applications" 
ON public.launched_applications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own launched applications" 
ON public.launched_applications 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_launched_applications_updated_at
BEFORE UPDATE ON public.launched_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_launched_applications_user_id ON public.launched_applications(user_id);
CREATE INDEX idx_launched_applications_launched_at ON public.launched_applications(launched_at DESC);
CREATE INDEX idx_launched_applications_status ON public.launched_applications(status);