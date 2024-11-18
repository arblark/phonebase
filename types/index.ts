export interface PhoneRecord {
  id: string;
  phoneNumber: string;
  comments: Comment[];
  rating: number;
  isDangerous: boolean;
  dateAdded: string;
  blurred?: boolean;
}

export interface Comment {
  id: string;
  text: string;
  isPositive: boolean;
  dateAdded: string;
  userId: string;
  userName: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
  created_at: string;
  telegram_id?: string;
  verification_code?: string;
  code_expires_at?: string;
  daily_password?: string;
  password_expires_at?: string;
  device_id?: string;
  password_requested_at?: string;
}

export interface LogEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  user: string;
}

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
          telegram_id?: string;
          verification_code?: string;
          code_expires_at?: string;
          daily_password?: string;
          password_expires_at?: string;
          device_id?: string;
          password_requested_at?: string;
        };
        Insert: {
          id?: string;
          username: string;
          password: string;
          role: 'admin' | 'user';
          created_at?: string;
          telegram_id?: string;
          verification_code?: string;
          code_expires_at?: string;
          daily_password?: string;
          password_expires_at?: string;
          device_id?: string;
          password_requested_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          password?: string;
          role?: 'admin' | 'user';
          created_at?: string;
          telegram_id?: string;
          verification_code?: string;
          code_expires_at?: string;
          daily_password?: string;
          password_expires_at?: string;
          device_id?: string;
          password_requested_at?: string;
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
          user_id: string | null;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          action: string;
          details: string;
          user_id?: string | null;
          timestamp?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          action?: string;
          details?: string;
          user_id?: string | null;
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