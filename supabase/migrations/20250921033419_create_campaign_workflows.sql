CREATE TABLE public.campaign_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  workflow_sequence JSONB NOT NULL DEFAULT '[]'::jsonb,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('self-apply', 'apply-for-me')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.campaign_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own campaign workflows" 
ON public.campaign_workflows 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaign workflows" 
ON public.campaign_workflows 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaign workflows" 
ON public.campaign_workflows 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaign workflows" 
ON public.campaign_workflows 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE TRIGGER update_campaign_workflows_updated_at
BEFORE UPDATE ON public.campaign_workflows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_campaign_workflows_user_id ON public.campaign_workflows(user_id);