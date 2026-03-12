export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: "admin" | "user";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "admin" | "user";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "admin" | "user";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      prompts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          short_description: string;
          full_prompt_text: string;
          output_example: string | null;
          variables_json: Json;
          category_id: string | null;
          status: "draft" | "published";
          visibility: "public" | "hidden";
          cover_image_url: string | null;
          seo_title: string | null;
          seo_description: string | null;
          published_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          search_vector: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          short_description: string;
          full_prompt_text: string;
          output_example?: string | null;
          variables_json?: Json;
          category_id?: string | null;
          status?: "draft" | "published";
          visibility?: "public" | "hidden";
          cover_image_url?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          published_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          search_vector?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          short_description?: string;
          full_prompt_text?: string;
          output_example?: string | null;
          variables_json?: Json;
          category_id?: string | null;
          status?: "draft" | "published";
          visibility?: "public" | "hidden";
          cover_image_url?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          published_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          search_vector?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "prompts_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      prompt_tags: {
        Row: {
          prompt_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          prompt_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          prompt_id?: string;
          tag_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prompt_tags_prompt_id_fkey";
            columns: ["prompt_id"];
            referencedRelation: "prompts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prompt_tags_tag_id_fkey";
            columns: ["tag_id"];
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      prompt_views: {
        Row: {
          id: string;
          prompt_id: string;
          viewed_at: string;
          session_id: string | null;
          referrer: string | null;
          user_agent: string | null;
        };
        Insert: {
          id?: string;
          prompt_id: string;
          viewed_at?: string;
          session_id?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
        };
        Update: {
          id?: string;
          prompt_id?: string;
          viewed_at?: string;
          session_id?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "prompt_views_prompt_id_fkey";
            columns: ["prompt_id"];
            referencedRelation: "prompts";
            referencedColumns: ["id"];
          },
        ];
      };
      search_events: {
        Row: {
          id: string;
          query: string;
          category_slug: string | null;
          tag_slug: string | null;
          results_count: number;
          path: string;
          session_id: string | null;
          referrer: string | null;
          user_agent: string | null;
          searched_at: string;
        };
        Insert: {
          id?: string;
          query?: string;
          category_slug?: string | null;
          tag_slug?: string | null;
          results_count?: number;
          path?: string;
          session_id?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
          searched_at?: string;
        };
        Update: {
          id?: string;
          query?: string;
          category_slug?: string | null;
          tag_slug?: string | null;
          results_count?: number;
          path?: string;
          session_id?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
          searched_at?: string;
        };
        Relationships: [];
      };
      admin_events: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          entity_ref: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          entity_ref?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          entity_ref?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_events_admin_id_fkey";
            columns: ["admin_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: {
          user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      profile_role: "admin" | "user";
      prompt_status: "draft" | "published";
      prompt_visibility: "public" | "hidden";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
