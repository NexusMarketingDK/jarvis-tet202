// Generated from the Supabase schema (supabase/migrations/0001_initial_schema.sql).
// Regenerate with: supabase gen types typescript --project-id <ref> > this file
// (or via the Supabase MCP `generate_typescript_types` tool).

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action_type: string;
          created_at: string;
          device_id: string | null;
          error: string | null;
          id: string;
          output: string | null;
          payload: Json;
          status: string;
          user_id: string;
        };
        Insert: {
          action_type: string;
          created_at?: string;
          device_id?: string | null;
          error?: string | null;
          id?: string;
          output?: string | null;
          payload?: Json;
          status?: string;
          user_id: string;
        };
        Update: {
          action_type?: string;
          created_at?: string;
          device_id?: string | null;
          error?: string | null;
          id?: string;
          output?: string | null;
          payload?: Json;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'activity_logs_device_id_fkey';
            columns: ['device_id'];
            isOneToOne: false;
            referencedRelation: 'devices';
            referencedColumns: ['id'];
          },
        ];
      };
      api_keys: {
        Row: {
          created_at: string;
          encrypted_key: string;
          id: string;
          provider: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          encrypted_key: string;
          id?: string;
          provider: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          encrypted_key?: string;
          id?: string;
          provider?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      calendar_events: {
        Row: {
          created_at: string;
          description: string | null;
          ends_at: string;
          id: string;
          starts_at: string;
          title: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          ends_at: string;
          id?: string;
          starts_at: string;
          title: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          ends_at?: string;
          id?: string;
          starts_at?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      chats: {
        Row: {
          created_at: string;
          id: string;
          pinned: boolean;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          pinned?: boolean;
          title?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          pinned?: boolean;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      devices: {
        Row: {
          agent_version: string | null;
          created_at: string;
          id: string;
          last_seen_at: string | null;
          name: string;
          platform: string;
          status: string;
          user_id: string;
        };
        Insert: {
          agent_version?: string | null;
          created_at?: string;
          id?: string;
          last_seen_at?: string | null;
          name: string;
          platform?: string;
          status?: string;
          user_id: string;
        };
        Update: {
          agent_version?: string | null;
          created_at?: string;
          id?: string;
          last_seen_at?: string | null;
          name?: string;
          platform?: string;
          status?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      memories: {
        Row: {
          category: string;
          created_at: string;
          id: string;
          importance: number;
          key: string;
          updated_at: string;
          user_id: string;
          value: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          id?: string;
          importance?: number;
          key: string;
          updated_at?: string;
          user_id: string;
          value: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          id?: string;
          importance?: number;
          key?: string;
          updated_at?: string;
          user_id?: string;
          value?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          action: Json | null;
          chat_id: string;
          content: string;
          created_at: string;
          id: string;
          role: string;
          user_id: string;
        };
        Insert: {
          action?: Json | null;
          chat_id: string;
          content: string;
          created_at?: string;
          id?: string;
          role: string;
          user_id: string;
        };
        Update: {
          action?: Json | null;
          chat_id?: string;
          content?: string;
          created_at?: string;
          id?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_chat_id_fkey';
            columns: ['chat_id'];
            isOneToOne: false;
            referencedRelation: 'chats';
            referencedColumns: ['id'];
          },
        ];
      };
      plugins: {
        Row: {
          config: Json;
          created_at: string;
          enabled: boolean;
          id: string;
          name: string;
          user_id: string;
        };
        Insert: {
          config?: Json;
          created_at?: string;
          enabled?: boolean;
          id?: string;
          name: string;
          user_id: string;
        };
        Update: {
          config?: Json;
          created_at?: string;
          enabled?: boolean;
          id?: string;
          name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          actions_enabled: boolean;
          developer_mode: boolean;
          language: string;
          theme: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          actions_enabled?: boolean;
          developer_mode?: boolean;
          language?: string;
          theme?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          actions_enabled?: boolean;
          developer_mode?: boolean;
          language?: string;
          theme?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      skills: {
        Row: {
          config: Json;
          created_at: string;
          enabled: boolean;
          id: string;
          name: string;
          user_id: string;
        };
        Insert: {
          config?: Json;
          created_at?: string;
          enabled?: boolean;
          id?: string;
          name: string;
          user_id: string;
        };
        Update: {
          config?: Json;
          created_at?: string;
          enabled?: boolean;
          id?: string;
          name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          created_at: string;
          description: string | null;
          due_at: string | null;
          id: string;
          status: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          due_at?: string | null;
          id?: string;
          status?: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          due_at?: string | null;
          id?: string;
          status?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      voice_settings: {
        Row: {
          elevenlabs_voice_id: string | null;
          stt_enabled: boolean;
          tts_enabled: boolean;
          updated_at: string;
          user_id: string;
          wake_word: string;
        };
        Insert: {
          elevenlabs_voice_id?: string | null;
          stt_enabled?: boolean;
          tts_enabled?: boolean;
          updated_at?: string;
          user_id: string;
          wake_word?: string;
        };
        Update: {
          elevenlabs_voice_id?: string | null;
          stt_enabled?: boolean;
          tts_enabled?: boolean;
          updated_at?: string;
          user_id?: string;
          wake_word?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
