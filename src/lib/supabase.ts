import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      datasets: {
        Row: {
          id: string;
          name: string;
          type: string;
          upload_date: string;
          row_count: number;
          tags: string[];
          file_path: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          upload_date?: string;
          row_count: number;
          tags?: string[];
          file_path: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          upload_date?: string;
          row_count?: number;
          tags?: string[];
          file_path?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      linkedin_contacts: {
        Row: {
          id: string;
          name: string;
          company: string;
          title: string;
          date_sent: string;
          status: 'accepted' | 'pending' | 'declined';
          campaign_id: string;
          dataset_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          company: string;
          title: string;
          date_sent: string;
          status: 'accepted' | 'pending' | 'declined';
          campaign_id: string;
          dataset_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          company?: string;
          title?: string;
          date_sent?: string;
          status?: 'accepted' | 'pending' | 'declined';
          campaign_id?: string;
          dataset_id?: string;
          created_at?: string;
        };
      };
      email_contacts: {
        Row: {
          id: string;
          name: string;
          email: string;
          company: string;
          campaign_name: string;
          date_sent: string;
          opened: boolean;
          replied: boolean;
          dataset_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          company: string;
          campaign_name: string;
          date_sent: string;
          opened?: boolean;
          replied?: boolean;
          dataset_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          company?: string;
          campaign_name?: string;
          date_sent?: string;
          opened?: boolean;
          replied?: boolean;
          dataset_id?: string;
          created_at?: string;
        };
      };
      webinar_attendees: {
        Row: {
          id: string;
          name: string;
          email: string;
          company: string;
          industry: string;
          invited_date: string;
          rsvp_status: 'confirmed' | 'pending' | 'declined';
          webinar_id: string;
          dataset_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          company: string;
          industry: string;
          invited_date: string;
          rsvp_status?: 'confirmed' | 'pending' | 'declined';
          webinar_id: string;
          dataset_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          company?: string;
          industry?: string;
          invited_date?: string;
          rsvp_status?: 'confirmed' | 'pending' | 'declined';
          webinar_id?: string;
          dataset_id?: string;
          created_at?: string;
        };
      };
    };
  };
}