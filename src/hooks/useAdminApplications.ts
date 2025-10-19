import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminApplication {
  id: string;
  user_id: string;
  user_email?: string;
  job_id?: string;
  prospect_id?: string;
  job_title: string;
  company_name: string;
  prospect_name?: string;
  prospect_title?: string;
  job_url?: string;
  prospect_linkedin_url?: string;
  prospect_email?: string;
  workflow_sequence: string[];
  campaign_type: 'self-apply' | 'apply-for-me';
  status: 'in-progress' | 'completed' | 'failed';
  launched_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  workflow_completion?: {
    linkedin_connection: boolean;
    email: boolean;
    application: boolean;
  };
  workflow_completion_dates?: {
    linkedin_connection?: string;
    email?: string;
    application?: string;
  };
  messages_sent?: {
    type: string;
    content: string;
    sent_at: string;
  }[];
  resume_filename?: string;
  notes?: string;
}

// Mock data for development
const mockAdminApplications: AdminApplication[] = [
  {
    id: '1',
    user_id: 'user-1',
    user_email: 'john.doe@example.com',
    job_id: 'job-1',
    prospect_id: 'person-1',
    job_title: 'Senior Software Engineer',
    company_name: 'TechCorp Inc',
    prospect_name: 'Sarah Johnson',
    prospect_title: 'Engineering Manager',
    job_url: 'https://www.linkedin.com/jobs/view/3756234589/',
    prospect_linkedin_url: 'https://www.linkedin.com/in/sarah-johnson-engineer/',
    prospect_email: 'sarah.johnson@techcorp.com',
    workflow_sequence: ['connect', 'apply', 'email'],
    campaign_type: 'apply-for-me',
    status: 'completed',
    launched_at: '2024-01-15T09:00:00Z',
    completed_at: '2024-01-16T14:30:00Z',
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-16T14:30:00Z',
    workflow_completion: {
      linkedin_connection: true,
      email: true,
      application: true
    },
    workflow_completion_dates: {
      linkedin_connection: '2024-01-15T09:15:00Z',
      email: '2024-01-15T10:30:00Z',
      application: '2024-01-16T14:30:00Z'
    },
    messages_sent: [
      {
        type: 'connect',
        content: 'Hi Sarah! I noticed your work at TechCorp Inc and would love to connect. I\'m very interested in the Senior Software Engineer position and believe my experience in React and Node.js would be a great fit for your team.',
        sent_at: '2024-01-15T09:15:00Z'
      },
      {
        type: 'email',
        content: 'Hi Sarah,\n\nThank you for connecting with me on LinkedIn! I wanted to follow up regarding the Senior Software Engineer position at TechCorp Inc.\n\nI have 5+ years of experience building scalable web applications with React, Node.js, and cloud technologies. I\'m particularly excited about TechCorp\'s innovative approach to software development.\n\nI\'ve attached my resume for your review. Would you be available for a brief call to discuss how I could contribute to your engineering team?\n\nBest regards,\nJohn Doe',
        sent_at: '2024-01-15T10:30:00Z'
      }
    ],
    resume_filename: 'john_doe_resume_2024.pdf',
    notes: 'Strong candidate with 5+ years React experience. Follow up needed.'
  },
  {
    id: '2',
    user_id: 'user-2',
    user_email: 'jane.smith@example.com',
    job_id: 'job-2',
    job_title: 'Full Stack Developer',
    company_name: 'StartupXYZ',
    prospect_name: 'Michael Chen',
    prospect_title: 'CTO',
    job_url: 'https://jobs.startupxyz.com/full-stack-developer',
    prospect_linkedin_url: 'https://www.linkedin.com/in/michael-chen-cto/',
    prospect_email: 'michael.chen@startupxyz.com',
    workflow_sequence: ['apply'],
    campaign_type: 'self-apply',
    status: 'completed',
    launched_at: '2024-01-14T16:00:00Z',
    completed_at: '2024-01-14T16:00:00Z',
    created_at: '2024-01-14T16:00:00Z',
    updated_at: '2024-01-14T16:00:00Z',
    workflow_completion: {
      linkedin_connection: false,
      email: false,
      application: true
    },
    workflow_completion_dates: {
      application: '2024-01-14T16:00:00Z'
    },
    messages_sent: [],
    resume_filename: 'jane_smith_fullstack_resume.pdf',
    notes: 'Self-apply candidate, no outreach needed.'
  },
  {
    id: '3',
    user_id: 'user-3',
    user_email: 'alex.wilson@example.com',
    job_id: 'job-3',
    prospect_id: 'person-3',
    job_title: 'Product Manager',
    company_name: 'InnovateLabs',
    prospect_name: 'Emily Rodriguez',
    prospect_title: 'Head of Product',
    job_url: 'https://careers.innovatelabs.com/product-manager',
    prospect_linkedin_url: 'https://www.linkedin.com/in/emily-rodriguez-product/',
    prospect_email: 'emily.rodriguez@innovatelabs.com',
    workflow_sequence: ['connect', 'email'],
    campaign_type: 'apply-for-me',
    status: 'in-progress',
    launched_at: '2024-01-16T11:00:00Z',
    created_at: '2024-01-16T11:00:00Z',
    updated_at: '2024-01-16T11:00:00Z',
    workflow_completion: {
      linkedin_connection: true,
      email: false,
      application: false
    },
    workflow_completion_dates: {
      linkedin_connection: '2024-01-16T11:15:00Z'
    },
    messages_sent: [
      {
        type: 'connect',
        content: 'Hello Emily! I came across the Product Manager role at InnovateLabs and I\'m very interested. With my background in product strategy and user research, I believe I could help drive InnovateLabs\' product vision forward. Would love to connect!',
        sent_at: '2024-01-16T11:15:00Z'
      }
    ],
    resume_filename: 'alex_wilson_pm_resume.pdf',
    notes: 'LinkedIn connection sent, awaiting response for email follow-up.'
  },
  {
    id: '4',
    user_id: 'user-4',
    user_email: 'sara.jones@example.com',
    job_id: 'job-4',
    prospect_id: 'person-4',
    job_title: 'DevOps Engineer',
    company_name: 'CloudTech Solutions',
    prospect_name: 'David Kim',
    prospect_title: 'DevOps Lead',
    job_url: 'https://indeed.com/viewjob?jk=5a2b3c4d5e6f7g8h',
    prospect_linkedin_url: 'https://www.linkedin.com/in/david-kim-devops/',
    prospect_email: 'david.kim@cloudtechsolutions.com',
    workflow_sequence: ['connect', 'apply', 'email'],
    campaign_type: 'apply-for-me',
    status: 'failed',
    launched_at: '2024-01-13T08:00:00Z',
    created_at: '2024-01-13T08:00:00Z',
    updated_at: '2024-01-13T08:30:00Z',
    workflow_completion: {
      linkedin_connection: false,
      email: false,
      application: false
    },
    workflow_completion_dates: {},
    messages_sent: [],
    resume_filename: 'sara_jones_devops_resume.pdf',
    notes: 'LinkedIn connection failed, need alternative approach. Consider direct email.'
  }
];

export const useAdminApplications = () => {
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch applications and profiles separately, then join them
      const [applicationsResult, profilesResult] = await Promise.all([
        supabase
          .from('launched_applications')
          .select('*')
          .order('launched_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('user_id, email')
      ]);

      if (applicationsResult.error) {
        throw applicationsResult.error;
      }

      if (profilesResult.error) {
        console.warn('Failed to fetch profiles:', profilesResult.error);
      }

      // Create a map of user_id to email for quick lookup
      const emailMap = new Map(
        (profilesResult.data || []).map(profile => [profile.user_id, profile.email])
      );

      // Transform the data to match our interface
      const transformedData: AdminApplication[] = (applicationsResult.data || []).map(item => ({
        ...item,
        user_email: emailMap.get(item.user_id) || 'user@example.com',
        campaign_type: (item.campaign_type as 'self-apply' | 'apply-for-me'),
        status: (item.status as 'in-progress' | 'completed' | 'failed'),
        workflow_sequence: Array.isArray(item.workflow_sequence) 
          ? (item.workflow_sequence as string[]).filter(s => typeof s === 'string')
          : [],
        messages_sent: Array.isArray(item.messages_sent) 
          ? (item.messages_sent as any[]).filter(msg => msg && typeof msg === 'object')
          : [],
        workflow_completion: {
          linkedin_connection: item.status === 'completed',
          email: item.status === 'completed',
          application: item.status === 'completed'
        },
        workflow_completion_dates: item.status === 'completed' ? {
          linkedin_connection: item.launched_at,
          email: item.launched_at,
          application: item.completed_at || item.launched_at
        } : {},
        prospect_linkedin_url: item.prospect_name ? 
          `https://linkedin.com/in/${item.prospect_name.toLowerCase().replace(' ', '-')}` : undefined,
        prospect_email: item.prospect_name ? 
          `${item.prospect_name.toLowerCase().replace(' ', '.')}@${item.company_name.toLowerCase().replace(' ', '')}.com` : undefined,
        notes: item.status === 'completed' ? 'Application completed successfully' : 'Application in progress'
      }));
      
      setApplications(transformedData);
      
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError('Failed to fetch applications');
      // Show empty state instead of mock data
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const updateWorkflowCompletion = async (appId: string, action: string, completed: boolean) => {
    try {
      const completionDate = completed ? new Date().toISOString() : undefined;
      
      // Update local state immediately for better UX
      setApplications(prev => prev.map(app => 
        app.id === appId 
          ? { 
              ...app, 
              workflow_completion: {
                ...app.workflow_completion,
                [action]: completed
              },
              workflow_completion_dates: {
                ...app.workflow_completion_dates,
                [action]: completionDate
              }
            }
          : app
      ));

      // In a real implementation, you might want to store this in a separate table
      // or add a workflow_completion column to launched_applications
      // For now, we'll just update the local state
      
    } catch (err) {
      console.error('Failed to update workflow completion:', err);
      // Revert the optimistic update on error
      setApplications(prev => prev.map(app => 
        app.id === appId 
          ? { 
              ...app, 
              workflow_completion: {
                ...app.workflow_completion,
                [action]: !completed
              },
              workflow_completion_dates: {
                ...app.workflow_completion_dates,
                [action]: !completed ? undefined : app.workflow_completion_dates?.[action]
              }
            }
          : app
      ));
      setError('Failed to update workflow completion');
    }
  };

  const updateApplicationStatus = (applicationId: string, status: 'in-progress' | 'completed' | 'failed') => {
    setApplications(prev =>
      prev.map(app =>
        app.id === applicationId ? { ...app, status } : app
      )
    );
  };

  const updateApplicationNotes = (applicationId: string, notes: string) => {
    setApplications(prev =>
      prev.map(app =>
        app.id === applicationId ? { ...app, notes } : app
      )
    );
  };

  const updateMessageContent = (applicationId: string, messageType: string, content: string) => {
    setApplications(prev =>
      prev.map(app =>
        app.id === applicationId
          ? {
              ...app,
              messages_sent: app.messages_sent?.map(msg =>
                msg.type === messageType ? { ...msg, content } : msg
              ) || []
            }
          : app
      )
    );
  };

  return {
    applications,
    loading,
    error,
    refetch: fetchApplications,
    updateWorkflowCompletion,
    updateApplicationStatus,
    updateApplicationNotes,
    updateMessageContent,
  };
};