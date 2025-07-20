import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'admin' | 'user';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: 'admin' | 'user';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'admin' | 'user';
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          date: string;
          time: string;
          location: string;
          max_attendees: number;
          current_attendees: number;
          registration_fee: number;
          bank_details: string | null;

          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          date: string;
          time: string;
          location: string;
          max_attendees: number;
          current_attendees?: number;
          registration_fee?: number;
          bank_details?: string | null;
    
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          date?: string;
          time?: string;
          location?: string;
          max_attendees?: number;
          current_attendees?: number;
          registration_fee?: number;
          bank_details?: string | null;
       
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      registrations: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          status: 'registered' | 'checked_in' | 'cancelled';
          registered_at: string;
          checked_in_at: string | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          status?: 'registered' | 'checked_in' | 'cancelled';
          registered_at?: string;
          checked_in_at?: string | null;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          status?: 'registered' | 'checked_in' | 'cancelled';
          registered_at?: string;
          checked_in_at?: string | null;
        };
      };
    };
  };
};