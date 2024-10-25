export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          password: string;
          role: 'admin' | 'user';
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          password: string;
          role: 'admin' | 'user';
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          password?: string;
          role?: 'admin' | 'user';
          created_at?: string;
        };
      };
      phone_records: {
        Row: {
          id: string;
          phone_number: string;
          rating: number;
          is_dangerous: boolean;
          date_added: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          phone_number: string;
          rating?: number;
          is_dangerous?: boolean;
          date_added?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          phone_number?: string;
          rating?: number;
          is_dangerous?: boolean;
          date_added?: string;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          phone_id: string;
          user_id: string;
          text: string;
          is_positive: boolean;
          date_added: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          phone_id: string;
          user_id: string;
          text: string;
          is_positive?: boolean;
          date_added?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          phone_id?: string;
          user_id?: string;
          text?: string;
          is_positive?: boolean;
          date_added?: string;
          created_at?: string;
        };
      };
      logs: {
        Row: {
          id: string;
          action: string;
          details: string;
          user_id: string;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          action: string;
          details: string;
          user_id?: string;
          timestamp?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          action?: string;
          details?: string;
          user_id?: string;
          timestamp?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}