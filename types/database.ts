export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type TaskStatus = "todo" | "in_progress" | "completed";
type Priority = "low" | "medium" | "high";
type SavedItemType = "article" | "video" | "repository" | "document" | "link" | "other";

type TimestampColumns = {
  created_at: string;
  updated_at: string;
};

type TimestampInsert = {
  created_at?: string;
  updated_at?: string;
};

type TimestampUpdate = {
  updated_at?: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          timezone: string | null;
          username_changed_at: string | null;
          onboarding_completed: boolean;
        } & TimestampColumns;
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          timezone?: string | null;
          username_changed_at?: string | null;
          onboarding_completed?: boolean;
        } & TimestampInsert;
        Update: {
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          timezone?: string | null;
          username_changed_at?: string | null;
          onboarding_completed?: boolean;
        } & TimestampUpdate;
        Relationships: [];
      };
      user_settings: {
        Row: {
          user_id: string;
          preferences: Json;
        } & TimestampColumns;
        Insert: {
          user_id: string;
          preferences?: Json;
        } & TimestampInsert;
        Update: {
          preferences?: Json;
        } & TimestampUpdate;
        Relationships: [];
      };
      spaces: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          icon: string;
          color: string;
        } & TimestampColumns;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string;
          icon?: string;
          color?: string;
        } & TimestampInsert;
        Update: {
          name?: string;
          description?: string;
          icon?: string;
          color?: string;
        } & TimestampUpdate;
        Relationships: [];
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          space_id: string | null;
          title: string;
          content: string;
          is_favorite: boolean;
          is_trashed: boolean;
        } & TimestampColumns;
        Insert: {
          id?: string;
          user_id: string;
          space_id?: string | null;
          title: string;
          content?: string;
          is_favorite?: boolean;
          is_trashed?: boolean;
        } & TimestampInsert;
        Update: {
          space_id?: string | null;
          title?: string;
          content?: string;
          is_favorite?: boolean;
          is_trashed?: boolean;
        } & TimestampUpdate;
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          space_id: string | null;
          title: string;
          description: string;
          status: TaskStatus;
          priority: Priority;
          due_date: string | null;
          reminder_at: string | null;
        } & TimestampColumns;
        Insert: {
          id?: string;
          user_id: string;
          space_id?: string | null;
          title: string;
          description?: string;
          status?: TaskStatus;
          priority?: Priority;
          due_date?: string | null;
          reminder_at?: string | null;
        } & TimestampInsert;
        Update: {
          space_id?: string | null;
          title?: string;
          description?: string;
          status?: TaskStatus;
          priority?: Priority;
          due_date?: string | null;
          reminder_at?: string | null;
        } & TimestampUpdate;
        Relationships: [];
      };
      subtasks: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          title: string;
          completed: boolean;
          position: number;
        } & TimestampColumns;
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          title: string;
          completed?: boolean;
          position?: number;
        } & TimestampInsert;
        Update: {
          title?: string;
          completed?: boolean;
          position?: number;
        } & TimestampUpdate;
        Relationships: [];
      };
      folders: {
        Row: {
          id: string;
          user_id: string;
          space_id: string | null;
          parent_id: string | null;
          name: string;
          is_favorite: boolean;
          is_trashed: boolean;
        } & TimestampColumns;
        Insert: {
          id?: string;
          user_id: string;
          space_id?: string | null;
          parent_id?: string | null;
          name: string;
          is_favorite?: boolean;
          is_trashed?: boolean;
        } & TimestampInsert;
        Update: {
          space_id?: string | null;
          parent_id?: string | null;
          name?: string;
          is_favorite?: boolean;
          is_trashed?: boolean;
        } & TimestampUpdate;
        Relationships: [];
      };
      files: {
        Row: {
          id: string;
          user_id: string;
          folder_id: string | null;
          space_id: string | null;
          storage_path: string;
          filename: string;
          mime_type: string | null;
          size_bytes: number;
          metadata: Json;
          is_favorite: boolean;
          is_trashed: boolean;
        } & TimestampColumns;
        Insert: {
          id?: string;
          user_id: string;
          folder_id?: string | null;
          space_id?: string | null;
          storage_path: string;
          filename: string;
          mime_type?: string | null;
          size_bytes?: number;
          metadata?: Json;
          is_favorite?: boolean;
          is_trashed?: boolean;
        } & TimestampInsert;
        Update: {
          folder_id?: string | null;
          space_id?: string | null;
          storage_path?: string;
          filename?: string;
          mime_type?: string | null;
          size_bytes?: number;
          metadata?: Json;
          is_favorite?: boolean;
          is_trashed?: boolean;
        } & TimestampUpdate;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          user_id: string;
          space_id: string | null;
          title: string;
          description: string;
          location: string;
          starts_at: string;
          ends_at: string;
        } & TimestampColumns;
        Insert: {
          id?: string;
          user_id: string;
          space_id?: string | null;
          title: string;
          description?: string;
          location?: string;
          starts_at: string;
          ends_at: string;
        } & TimestampInsert;
        Update: {
          space_id?: string | null;
          title?: string;
          description?: string;
          location?: string;
          starts_at?: string;
          ends_at?: string;
        } & TimestampUpdate;
        Relationships: [];
      };
      saved_items: {
        Row: {
          id: string;
          user_id: string;
          space_id: string | null;
          url: string;
          title: string;
          description: string;
          type: SavedItemType;
          preview_image: string | null;
          is_favorite: boolean;
        } & TimestampColumns;
        Insert: {
          id?: string;
          user_id: string;
          space_id?: string | null;
          url: string;
          title: string;
          description?: string;
          type?: SavedItemType;
          preview_image?: string | null;
          is_favorite?: boolean;
        } & TimestampInsert;
        Update: {
          space_id?: string | null;
          url?: string;
          title?: string;
          description?: string;
          type?: SavedItemType;
          preview_image?: string | null;
          is_favorite?: boolean;
        } & TimestampUpdate;
        Relationships: [];
      };
      lists: {
        Row: {
          id: string;
          user_id: string;
          space_id: string | null;
          name: string;
        } & TimestampColumns;
        Insert: {
          id?: string;
          user_id: string;
          space_id?: string | null;
          name: string;
        } & TimestampInsert;
        Update: {
          space_id?: string | null;
          name?: string;
        } & TimestampUpdate;
        Relationships: [];
      };
      list_items: {
        Row: {
          id: string;
          list_id: string;
          user_id: string;
          text: string;
          completed: boolean;
          position: number;
        } & TimestampColumns;
        Insert: {
          id?: string;
          list_id: string;
          user_id: string;
          text: string;
          completed?: boolean;
          position?: number;
        } & TimestampInsert;
        Update: {
          text?: string;
          completed?: boolean;
          position?: number;
        } & TimestampUpdate;
        Relationships: [];
      };
      focus_sessions: {
        Row: {
          id: string;
          user_id: string;
          space_id: string | null;
          task_id: string | null;
          duration_minutes: number;
          started_at: string;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          space_id?: string | null;
          task_id?: string | null;
          duration_minutes: number;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          space_id?: string | null;
          task_id?: string | null;
          duration_minutes?: number;
          started_at?: string;
          completed_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
