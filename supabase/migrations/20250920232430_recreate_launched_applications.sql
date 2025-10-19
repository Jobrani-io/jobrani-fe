drop table if exists launched_applications;

CREATE TABLE public.launched_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  prospect_id UUID REFERENCES public.saved_prospects(id),
  match_id UUID NOT NULL REFERENCES public.preferred_matches(id),
  resume_id UUID NOT NULL REFERENCES public.user_resumes(id),
  workflow_sequence JSONB NOT NULL DEFAULT '[]'::jsonb,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('self-apply', 'apply-for-me')),
  status TEXT NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'failed')),
  messages JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.launched_applications ENABLE ROW LEVEL SECURITY;

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

CREATE TRIGGER update_launched_applications_updated_at
BEFORE UPDATE ON public.launched_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_launched_applications_user_id ON public.launched_applications(user_id);
CREATE INDEX idx_launched_applications_status ON public.launched_applications(status);