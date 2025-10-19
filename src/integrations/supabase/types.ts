export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      apollo_responses: {
        Row: {
          business_domain: string | null
          business_name: string | null
          created_at: string
          id: number
          job_title: string | null
          raw_data: Json | null
        }
        Insert: {
          business_domain?: string | null
          business_name?: string | null
          created_at?: string
          id?: number
          job_title?: string | null
          raw_data?: Json | null
        }
        Update: {
          business_domain?: string | null
          business_name?: string | null
          created_at?: string
          id?: number
          job_title?: string | null
          raw_data?: Json | null
        }
        Relationships: []
      }
      approved_prospects: {
        Row: {
          company: string
          contact_type: string
          created_at: string
          id: string
          industry: string
          job_description: string | null
          job_opening: string | null
          job_title: string
          name: string
          user_id: string
        }
        Insert: {
          company: string
          contact_type?: string
          created_at?: string
          id?: string
          industry: string
          job_description?: string | null
          job_opening?: string | null
          job_title: string
          name: string
          user_id: string
        }
        Update: {
          company?: string
          contact_type?: string
          created_at?: string
          id?: string
          industry?: string
          job_description?: string | null
          job_opening?: string | null
          job_title?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      beta_waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      campaign_workflows: {
        Row: {
          campaign_type: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
          workflow_sequence: Json
        }
        Insert: {
          campaign_type: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          workflow_sequence?: Json
        }
        Update: {
          campaign_type?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          workflow_sequence?: Json
        }
        Relationships: [
          {
            foreignKeyName: "campaign_workflows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      daily_generation_limits: {
        Row: {
          created_at: string
          generation_date: string
          id: string
          messages_generated: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          generation_date?: string
          id?: string
          messages_generated?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          generation_date?: string
          id?: string
          messages_generated?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      generated_messages: {
        Row: {
          approved: boolean
          created_at: string
          custom_instruction: string | null
          custom_instructions: string | null
          detail: Json | null
          generation_date: string
          id: string
          message_content: string
          platform_type: string | null
          prospect_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          custom_instruction?: string | null
          custom_instructions?: string | null
          detail?: Json | null
          generation_date?: string
          id?: string
          message_content: string
          platform_type?: string | null
          prospect_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          custom_instruction?: string | null
          custom_instructions?: string | null
          detail?: Json | null
          generation_date?: string
          id?: string
          message_content?: string
          platform_type?: string | null
          prospect_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      json_cache: {
        Row: {
          created_at: string | null
          expires_at: string | null
          key: string
          value: Json
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          key: string
          value: Json
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          key?: string
          value?: Json
        }
        Relationships: []
      }
      launched_applications: {
        Row: {
          campaign_type: string
          completed_at: string | null
          created_at: string
          id: string
          match_id: string
          messages: Json | null
          notes: string | null
          prospect_id: string | null
          resume_id: string
          status: string
          updated_at: string
          user_id: string
          workflow_sequence: Json
        }
        Insert: {
          campaign_type: string
          completed_at?: string | null
          created_at?: string
          id?: string
          match_id: string
          messages?: Json | null
          notes?: string | null
          prospect_id?: string | null
          resume_id: string
          status?: string
          updated_at?: string
          user_id: string
          workflow_sequence?: Json
        }
        Update: {
          campaign_type?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          match_id?: string
          messages?: Json | null
          notes?: string | null
          prospect_id?: string | null
          resume_id?: string
          status?: string
          updated_at?: string
          user_id?: string
          workflow_sequence?: Json
        }
        Relationships: [
          {
            foreignKeyName: "launched_applications_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "preferred_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "launched_applications_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "saved_prospects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "launched_applications_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "user_resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "launched_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      linkedin_saved_jobs: {
        Row: {
          company_name: string
          created_at: string | null
          id: string
          job_title: string
          job_url: string | null
          linkedin_job_id: string
          location: string | null
          posted_date: string | null
          scraped_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string | null
          id?: string
          job_title: string
          job_url?: string | null
          linkedin_job_id: string
          location?: string | null
          posted_date?: string | null
          scraped_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string | null
          id?: string
          job_title?: string
          job_url?: string | null
          linkedin_job_id?: string
          location?: string | null
          posted_date?: string | null
          scraped_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      linkedin_saved_people: {
        Row: {
          company: string
          created_at: string | null
          id: string
          linkedin_id: string
          name: string
          profile_url: string
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string | null
          id?: string
          linkedin_id: string
          name: string
          profile_url: string
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string | null
          id?: string
          linkedin_id?: string
          name?: string
          profile_url?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      plan_features: {
        Row: {
          created_at: string
          enabled: boolean
          feature_name: string
          id: string
          plan_type: string
          weekly_limit: number | null
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          feature_name: string
          id?: string
          plan_type: string
          weekly_limit?: number | null
        }
        Update: {
          created_at?: string
          enabled?: boolean
          feature_name?: string
          id?: string
          plan_type?: string
          weekly_limit?: number | null
        }
        Relationships: []
      }
      preferred_matches: {
        Row: {
          id: string
          job_id: string
          preferred_at: string
          selected_match: Json
          user_id: string
        }
        Insert: {
          id?: string
          job_id: string
          preferred_at?: string
          selected_match: Json
          user_id: string
        }
        Update: {
          id?: string
          job_id?: string
          preferred_at?: string
          selected_match?: Json
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          gmail_access: boolean | null
          google_access_token: string | null
          google_expires_at: string | null
          google_refresh_token: string | null
          google_user_id: string | null
          id: string
          job_search_mindset: string | null
          linkedin_connected: boolean | null
          linkedin_last_scraped: string | null
          linkedin_password: string | null
          linkedin_scraping_status: string | null
          linkedin_username: string | null
          onboarding_completed: boolean
          onboarding_data: Json | null
          outreach_style: string | null
          profile_completed: boolean | null
          resume_info: Json | null
          salary_range: string | null
          target_jobs: string | null
          target_jobs_custom: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          gmail_access?: boolean | null
          google_access_token?: string | null
          google_expires_at?: string | null
          google_refresh_token?: string | null
          google_user_id?: string | null
          id?: string
          job_search_mindset?: string | null
          linkedin_connected?: boolean | null
          linkedin_last_scraped?: string | null
          linkedin_password?: string | null
          linkedin_scraping_status?: string | null
          linkedin_username?: string | null
          onboarding_completed?: boolean
          onboarding_data?: Json | null
          outreach_style?: string | null
          profile_completed?: boolean | null
          resume_info?: Json | null
          salary_range?: string | null
          target_jobs?: string | null
          target_jobs_custom?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          gmail_access?: boolean | null
          google_access_token?: string | null
          google_expires_at?: string | null
          google_refresh_token?: string | null
          google_user_id?: string | null
          id?: string
          job_search_mindset?: string | null
          linkedin_connected?: boolean | null
          linkedin_last_scraped?: string | null
          linkedin_password?: string | null
          linkedin_scraping_status?: string | null
          linkedin_username?: string | null
          onboarding_completed?: boolean
          onboarding_data?: Json | null
          outreach_style?: string | null
          profile_completed?: boolean | null
          resume_info?: Json | null
          salary_range?: string | null
          target_jobs?: string | null
          target_jobs_custom?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prospect_challenges: {
        Row: {
          challenges: Json
          created_at: string | null
          id: string
          job_title: string | null
          prospect_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          challenges: Json
          created_at?: string | null
          id?: string
          job_title?: string | null
          prospect_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          challenges?: Json
          created_at?: string | null
          id?: string
          job_title?: string | null
          prospect_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      prospect_matches: {
        Row: {
          created_at: string
          hiring_manager_titles: string[] | null
          id: string
          job_id: string
          matches: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          hiring_manager_titles?: string[] | null
          id?: string
          job_id: string
          matches: Json
          user_id: string
        }
        Update: {
          created_at?: string
          hiring_manager_titles?: string[] | null
          id?: string
          job_id?: string
          matches?: Json
          user_id?: string
        }
        Relationships: []
      }
      saved_prospects: {
        Row: {
          company: string
          company_url: string | null
          employment_type: string | null
          id: string
          is_remote: boolean | null
          job_description: string | null
          job_title: string
          location: string | null
          posted_on: string | null
          prospect_id: string
          raw: Json | null
          saved_date: string
          url: string | null
          user_id: string
        }
        Insert: {
          company: string
          company_url?: string | null
          employment_type?: string | null
          id?: string
          is_remote?: boolean | null
          job_description?: string | null
          job_title: string
          location?: string | null
          posted_on?: string | null
          prospect_id: string
          raw?: Json | null
          saved_date?: string
          url?: string | null
          user_id: string
        }
        Update: {
          company?: string
          company_url?: string | null
          employment_type?: string | null
          id?: string
          is_remote?: boolean | null
          job_description?: string | null
          job_title?: string
          location?: string | null
          posted_on?: string | null
          prospect_id?: string
          raw?: Json | null
          saved_date?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      serp_api_responses: {
        Row: {
          company: string
          created_at: string
          id: string
          last_used: string
          name: string
          query: string
          response: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string
          id?: string
          last_used?: string
          name: string
          query: string
          response: Json
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string
          id?: string
          last_used?: string
          name?: string
          query?: string
          response?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_cycle: string
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          plan_type: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_type: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          created_at: string
          id: string
          jobs_searched: number
          messages_generated: number
          outreach_sent: number
          prospects_found: number
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          jobs_searched?: number
          messages_generated?: number
          outreach_sent?: number
          prospects_found?: number
          updated_at?: string
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          jobs_searched?: number
          messages_generated?: number
          outreach_sent?: number
          prospects_found?: number
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_resumes: {
        Row: {
          content: string
          created_at: string
          file_id: string | null
          file_name: string
          highlights: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          file_id?: string | null
          file_name: string
          highlights?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          file_id?: string | null
          file_name?: string
          highlights?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_weekly_usage_track: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
